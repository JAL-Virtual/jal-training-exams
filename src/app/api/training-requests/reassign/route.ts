import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, trainerId, trainerName } = body;

    const db = await getDatabase();
    
    // Get the current assignment to find the old trainer
    const assignment = await db.collection('training-requests').findOne({
      _id: new ObjectId(assignmentId)
    });

    if (!assignment) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Update the assignment with new trainer
    const result = await db.collection('training-requests').updateOne(
      { _id: new ObjectId(assignmentId) },
      {
        $set: {
          assignedTrainerId: trainerId,
          assignedTrainerName: trainerName,
          status: 'assigned',
          updatedAt: new Date().toISOString()
        }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Assignment not found' },
        { status: 404 }
      );
    }

    // Decrease old trainer's assignment count if they were assigned
    if (assignment.assignedTrainerId) {
      await db.collection('trainers').updateOne(
        { _id: new ObjectId(assignment.assignedTrainerId) },
        { $inc: { currentAssignments: -1 } }
      );
    }

    // Increase new trainer's assignment count
    await db.collection('trainers').updateOne(
      { _id: new ObjectId(trainerId) },
      { $inc: { currentAssignments: 1 } }
    );

    return NextResponse.json({
      success: true,
      message: 'Assignment reassigned successfully'
    });
  } catch (error) {
    console.error('Error reassigning assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reassign assignment' },
      { status: 500 }
    );
  }
}
