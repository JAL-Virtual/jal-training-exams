import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const db = await getDatabase();
    const attempts = await db.collection('quiz_attempts').find({}).toArray();
    
    logger.info('Fetched quiz attempts', { count: attempts.length });
    
    return NextResponse.json({
      success: true,
      attempts: attempts
    });
  } catch (error) {
    logger.error('Error fetching quiz attempts', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quiz attempts'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    
    const attempt = {
      ...body,
      id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      startTime: new Date().toISOString(),
      status: 'in_progress',
      lastSaved: new Date().toISOString(),
      answers: []
    };
    
    await db.collection('quiz_attempts').insertOne(attempt);
    
    logger.info('Created quiz attempt', { attemptId: attempt.id, quizId: attempt.quizId });
    
    return NextResponse.json({
      success: true,
      attempt: attempt
    });
  } catch (error) {
    logger.error('Error creating quiz attempt', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create quiz attempt'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { attemptId, ...updates } = body;
    const db = await getDatabase();
    
    const result = await db.collection('quiz_attempts').updateOne(
      { id: attemptId },
      { 
        $set: {
          ...updates,
          lastSaved: new Date().toISOString()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Quiz attempt not found'
      }, { status: 404 });
    }
    
    logger.info('Updated quiz attempt', { attemptId, updates });
    
    return NextResponse.json({
      success: true,
      message: 'Quiz attempt updated successfully'
    });
  } catch (error) {
    logger.error('Error updating quiz attempt', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update quiz attempt'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attemptId = searchParams.get('id');
    
    if (!attemptId) {
      return NextResponse.json({
        success: false,
        error: 'Attempt ID is required'
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    const result = await db.collection('quiz_attempts').deleteOne({ id: attemptId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Quiz attempt not found'
      }, { status: 404 });
    }
    
    logger.info('Deleted quiz attempt', { attemptId });
    
    return NextResponse.json({
      success: true,
      message: 'Quiz attempt deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting quiz attempt', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete quiz attempt'
    }, { status: 500 });
  }
}
