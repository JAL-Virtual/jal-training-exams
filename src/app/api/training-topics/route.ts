import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const topics = await db.collection('training_topics').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      topics: topics.map(topic => ({
        id: topic._id.toString(),
        name: topic.name,
        description: topic.description,
        active: topic.active,
        createdAt: topic.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching training topics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training topics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'Topic name is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if topic with same name already exists
    const existingTopic = await db.collection('training_topics').findOne({ name });
    if (existingTopic) {
      return NextResponse.json(
        { success: false, error: 'Topic with this name already exists' },
        { status: 400 }
      );
    }

    const topic = {
      name,
      description: description || '',
      active: true,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('training_topics').insertOne(topic);

    return NextResponse.json({
      success: true,
      topic: {
        id: result.insertedId.toString(),
        ...topic
      }
    });
  } catch (error) {
    console.error('Error adding training topic:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add training topic' },
      { status: 500 }
    );
  }
}
