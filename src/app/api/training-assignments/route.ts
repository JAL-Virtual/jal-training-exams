import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const trainerId = searchParams.get('trainerId');
    
    const db = await getDatabase();
    
    let query = {};
    if (trainerId) {
      query = { assignedTrainer: trainerId };
    }
    
    const assignments = await db.collection('training_assignments').find(query).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      assignments: assignments.map(assignment => ({
        id: assignment._id.toString(),
        pilotId: assignment.pilotId,
        pilotName: assignment.pilotName,
        topicId: assignment.topicId,
        topicName: assignment.topicName,
        scheduledDate: assignment.scheduledDate,
        scheduledTime: assignment.scheduledTime,
        status: assignment.status,
        assignedTrainer: assignment.assignedTrainer,
        trainerName: assignment.trainerName,
        rating: assignment.rating,
        comments: assignment.comments,
        startTime: assignment.startTime,
        endTime: assignment.endTime,
        createdAt: assignment.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching training assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch training assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pilotId, pilotName, topicId, topicName, scheduledDate, scheduledTime, assignedTrainer, trainerName } = body;

    if (!pilotId || !pilotName || !topicId || !topicName || !scheduledDate || !scheduledTime || !assignedTrainer) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const db = await getDatabase();

    const assignment = {
      pilotId,
      pilotName,
      topicId,
      topicName,
      scheduledDate,
      scheduledTime,
      status: 'scheduled',
      assignedTrainer,
      trainerName: trainerName || '',
      rating: null,
      comments: '',
      startTime: null,
      endTime: null,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('training_assignments').insertOne(assignment);

    return NextResponse.json({
      success: true,
      assignment: {
        id: result.insertedId.toString(),
        ...assignment
      }
    });
  } catch (error) {
    console.error('Error creating training assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create training assignment' },
      { status: 500 }
    );
  }
}
