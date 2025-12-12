import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Subscription from '@/models/Subscription';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

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
        const { notificationTime, ...subscription } = body;

        if (!subscription || !subscription.endpoint) {
            return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
        }

        // Upsert subscription (update if exists, insert if new)
        // Include notificationTime if provided, otherwise use default (18:30)
        await Subscription.findOneAndUpdate(
            { endpoint: subscription.endpoint },
            {
                ...subscription,
                notificationTime: notificationTime || '18:30',
                lastNotified: null // Reset lastNotified when subscribing
            },
            { upsert: true, new: true }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving subscription:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
