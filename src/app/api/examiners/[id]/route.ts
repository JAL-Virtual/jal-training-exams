import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { active } = body;

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Active status must be a boolean' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('examiners').updateOne(
      { _id: new ObjectId(id) },
      { $set: { active } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Examiner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating examiner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update examiner' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = await getDatabase();

    const result = await db.collection('examiners').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Examiner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting examiner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete examiner' },
      { status: 500 }
    );
  }
}
