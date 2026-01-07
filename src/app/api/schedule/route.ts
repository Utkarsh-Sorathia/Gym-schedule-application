import dbConnect from '@/lib/db';
import Schedule from '@/models/Schedule';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    await dbConnect();
    try {
        const { searchParams } = new URL(request.url);
        const day = searchParams.get('day');

        let query = {};
        if (day) {
            query = { day: { $regex: new RegExp(`^${day}$`, 'i') } };
        }

        const schedules = await Schedule.find(query);
        return NextResponse.json({ success: true, data: schedules });
    } catch (error) {
        console.error('Error fetching schedules:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch schedules' }, { status: 400 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const { day, exercises } = body;

        if (!day || !exercises) {
            return NextResponse.json({ success: false, error: 'Day and exercises are required' }, { status: 400 });
        }

        // Check if schedule for the day already exists with case-insensitive search
        let schedule = await Schedule.findOne({ day: { $regex: new RegExp(`^${day}$`, 'i') } });

        if (schedule) {
            // Update existing schedule
            schedule.exercises = exercises;
            await schedule.save();
        } else {
            // Create new schedule
            schedule = await Schedule.create({ day, exercises });
        }

        return NextResponse.json({ success: true, data: schedule }, { status: 201 });
    } catch (error) {
        console.error('Error updating schedule:', error);
        return NextResponse.json({ success: false, error: 'Failed to update schedule' }, { status: 400 });
    }
}
