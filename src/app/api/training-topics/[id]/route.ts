import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const result = await db.collection('training_topics').deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete topic' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, description, active } = body;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid topic ID' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Topic name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if another topic with same name exists
    const existingTopic = await db.collection('training_topics').findOne({ 
      name, 
      _id: { $ne: new ObjectId(id) } 
    });
    
    if (existingTopic) {
      return NextResponse.json(
        { success: false, error: 'Topic with this name already exists' },
        { status: 400 }
      );
    }

    const updateData = {
      name,
      description: description || '',
      active: active !== undefined ? active : true,
      updatedAt: new Date().toISOString()
    };

    const result = await db.collection('training_topics').updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Topic not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Topic updated successfully'
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update topic' },
      { status: 500 }
    );
  }
}
