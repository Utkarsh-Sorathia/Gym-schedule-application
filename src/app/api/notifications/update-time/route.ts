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
        const { endpoint, notificationTime } = await request.json();

        if (!endpoint || !notificationTime) {
            return NextResponse.json({ error: 'Missing endpoint or notificationTime' }, { status: 400 });
        }

        // Validate time format (HH:MM)
        const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;
        if (!timeRegex.test(notificationTime)) {
            return NextResponse.json({ error: 'Invalid time format. Use HH:MM (24-hour)' }, { status: 400 });
        }

        // Update notification time for existing subscription
        const updated = await Subscription.findOneAndUpdate(
            { endpoint },
            { notificationTime },
            { new: true }
        );

        if (!updated) {
            return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, notificationTime });
    } catch (error) {
        console.error('Error updating notification time:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
