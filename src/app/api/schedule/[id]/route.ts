import dbConnect from '@/lib/db';
import Schedule from '@/models/Schedule';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;
    try {
        const result = await Schedule.deleteOne({ _id: id });
        if (result.deletedCount === 0) {
            return NextResponse.json({ success: false, error: 'Schedule not found' }, { status: 404 });
        }
        return NextResponse.json({ success: true, data: {} });
    } catch (error) {
        console.error('Error deleting schedule:', error);
        return NextResponse.json({ success: false, error: 'Failed to delete schedule' }, { status: 400 });
    }
}
