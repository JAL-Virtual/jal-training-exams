import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const requests = await db.collection('training_requests').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      requests: requests.map(request => ({
        id: request._id.toString(),
        pilotId: request.pilotId,
        pilotName: request.pilotName,
        topicId: request.topicId,
        topicName: request.topicName,
        requestedDate: request.requestedDate,
        requestedTime: request.requestedTime,
        comments: request.comments,
        status: request.status,
        assignedTrainer: request.assignedTrainer,
        createdAt: request.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching training requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training requests' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pilotId, pilotName, topicId, topicName, requestedDate, requestedTime, comments } = body;

    if (!pilotId || !pilotName || !topicId || !topicName || !requestedDate || !requestedTime) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const trainingRequest = {
      pilotId,
      pilotName,
      topicId,
      topicName,
      requestedDate,
      requestedTime,
      comments: comments || '',
      status: 'pending',
      assignedTrainer: null,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('training_requests').insertOne(trainingRequest);

    return NextResponse.json({
      success: true,
      request: {
        id: result.insertedId.toString(),
        ...trainingRequest
      }
    });
  } catch (error) {
    console.error('Error creating training request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create training request' },
      { status: 500 }
    );
  }
}
