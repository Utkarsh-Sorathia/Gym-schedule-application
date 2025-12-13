import { NextResponse } from 'next/server';
import webpush from 'web-push';
import mongoose from 'mongoose';
import Subscription from '@/models/Subscription';

const MONGODB_URI = process.env.MONGODB_URI;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@gymschedule.com';
const CRON_SECRET = process.env.CRON_SECRET;

if (!MONGODB_URI || !VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.error('Missing environment variables for notifications');
}

webpush.setVapidDetails(
    VAPID_SUBJECT,
    VAPID_PUBLIC_KEY as string,
    VAPID_PRIVATE_KEY as string
);

async function connectDB() {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    await mongoose.connect(MONGODB_URI as string);
}

export async function GET(request: Request) {
    try {
        // Verify the request is authorized
        const authHeader = request.headers.get('authorization');

        // Check for Vercel Cron secret or custom authorization
        if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get current time in IST (Asia/Kolkata timezone)
        const now = new Date();
        const istTime = new Intl.DateTimeFormat('en-IN', {
            timeZone: 'Asia/Kolkata',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }).format(now);

        // Get today's date in YYYY-MM-DD format
        const today = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
            .toISOString()
            .split('T')[0];

        console.log(`[Cron] Running at IST time: ${istTime}, Date: ${today}`);

        // Find all subscriptions that haven't been notified today
        // Since this runs once daily at 6:30 PM IST, send to everyone
        const subscriptions = await Subscription.find({
            $or: [
                { lastNotified: { $ne: today } },
                { lastNotified: null }
            ]
        });

        console.log(`[Cron] Found ${subscriptions.length} subscriptions to notify`);

        if (subscriptions.length === 0) {
            return NextResponse.json({
                message: `No subscriptions found to notify`,
                success: true,
                time: istTime,
                date: today
            });
        }

        // Import quote and day utilities
        const { getRandomQuote, getDayName } = await import('@/lib/quotes');

        // Muscle groups mapping
        const MUSCLE_GROUPS: { [key: string]: string } = {
            'Monday': 'Chest & Triceps',
            'Tuesday': 'Back & Biceps',
            'Wednesday': 'Shoulders',
            'Thursday': 'Legs & Abs',
            'Friday': 'Biceps, Triceps & Forearms',
            'Saturday': 'Chest & Shoulders',
            'Sunday': 'Rest',
        };

        // Fetch today's workout
        const day = getDayName();
        const workoutFocus = `It's ${MUSCLE_GROUPS[day]} Day` || "Your scheduled workout";

        try {
            const scheduleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/schedule?day=${day}`);
            const scheduleData = await scheduleResponse.json();

            if (scheduleData.success && scheduleData.data && scheduleData.data.length > 0) {
                const schedule = scheduleData.data[0];
                // If there are exercises, we can confirm the workout exists
                if (schedule.exercises && schedule.exercises.length > 0) {
                    // workoutFocus is already set from MUSCLE_GROUPS
                }
            }
        } catch (error) {
            console.error('Error fetching workout:', error);
        }

        const quote = getRandomQuote();
        const title = `🏋️ Time for Gym - ${day}'s Workout!`;
        const notificationBody = `${workoutFocus}\n\n${quote}`;

        const payload = JSON.stringify({
            title,
            body: notificationBody,
            icon: '/icon.svg',
            url: '/schedule',
        });

        const results = await Promise.allSettled(
            subscriptions.map((sub) =>
                webpush.sendNotification(sub, payload, {
                    headers: {
                        'Urgency': 'high',
                        'TTL': '86400' // 24 hours
                    }
                }).catch((err) => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription is invalid/expired, remove it
                        return Subscription.deleteOne({ _id: sub._id });
                    }
                    throw err;
                })
            )
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;

        // Update lastNotified for all subscriptions that were processed
        await Subscription.updateMany(
            { _id: { $in: subscriptions.map(s => s._id) } },
            { lastNotified: today }
        );

        console.log(`[Cron] Sent to ${successCount} of ${subscriptions.length} subscriptions`);

        return NextResponse.json({
            success: true,
            message: `Sent to ${successCount} of ${subscriptions.length} subscriptions`,
            time: istTime,
            date: today
        });
    } catch (error) {
        console.error('Error sending scheduled notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
