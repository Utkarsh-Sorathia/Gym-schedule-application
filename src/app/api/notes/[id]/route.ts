import dbConnect from '@/lib/db';
import Note from '@/models/Note';
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const body = await request.json();
        const note = await Note.findByIdAndUpdate(id, body, {
            new: true,
            runValidators: true,
        });
        if (!note) {
            return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: note });
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json({ success: false, error: 'Failed to update note' }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const result = await Note.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Note not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting note:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete note' }, { status: 400 });
    }
}
