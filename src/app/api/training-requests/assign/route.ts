import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const assignments = await db.collection('training-requests').find({}).toArray();
    
    return NextResponse.json({
      success: true,
      assignments: assignments.map(assignment => ({
        id: assignment._id.toString(),
        studentId: assignment.studentId,
        studentName: assignment.studentName,
        topicId: assignment.topicId,
        topicName: assignment.topicName,
        assignedTrainerId: assignment.assignedTrainerId,
        assignedTrainerName: assignment.assignedTrainerName,
        status: assignment.status || 'pending',
        requestedDate: assignment.requestedDate,
        requestedTime: assignment.requestedTime,
        comments: assignment.comments,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt
      }))
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, trainerId, trainerName } = body;

    const db = await getDatabase();
    
    // Update the assignment
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

    // Update trainer's current assignments count
    await db.collection('trainers').updateOne(
      { _id: new ObjectId(trainerId) },
      { $inc: { currentAssignments: 1 } }
    );

    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}
