import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { NextResponse } from 'next/server';

export async function GET() {
    await dbConnect();
    try {
        const notes = await Note.find({}).sort({ createdAt: -1 });
        return NextResponse.json({ success: true, data: notes });
    } catch (error) {
        console.error('Error fetching notes:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch notes' }, { status: 400 });
    }
}

export async function POST(request: Request) {
    await dbConnect();
    try {
        const body = await request.json();
        const note = await Note.create(body);
        return NextResponse.json({ success: true, data: note }, { status: 201 });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json({ success: false, error: 'Failed to create note' }, { status: 400 });
    }
}
