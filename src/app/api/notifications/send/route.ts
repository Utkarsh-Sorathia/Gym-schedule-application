import { NextResponse } from 'next/server';
import webpush from 'web-push';
import mongoose from 'mongoose';
import Subscription from '@/models/Subscription';

const MONGODB_URI = process.env.MONGODB_URI;
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@gymschedule.com';

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

export async function POST(request: Request) {
    try {
        await connectDB();
        const body = await request.json();

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
        const title = body.title || `🏋️ Time for Gym - ${day}'s Workout!`;
        const notificationBody = body.body || `${workoutFocus}\n\n${quote}`;

        const payload = JSON.stringify({
            title,
            body: notificationBody,
            icon: body.icon || '/icon.svg',
            url: body.url || '/schedule',
        });

        const subscriptions = await Subscription.find({});

        if (subscriptions.length === 0) {
            return NextResponse.json({ message: 'No subscriptions found', success: true });
        }

        const results = await Promise.allSettled(
            subscriptions.map((sub) =>
                webpush.sendNotification(sub, payload).catch((err) => {
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        // Subscription is invalid/expired, remove it
                        return Subscription.deleteOne({ _id: sub._id });
                    }
                    throw err;
                })
            )
        );

        const successCount = results.filter(r => r.status === 'fulfilled').length;

        return NextResponse.json({
            success: true,
            message: `Sent to ${successCount} of ${subscriptions.length} subscriptions`
        });
    } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
