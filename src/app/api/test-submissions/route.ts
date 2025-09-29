import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const db = await getDatabase();
    const submissions = await db.collection('test_submissions').find({}).toArray();
    
    logger.info('Fetched test submissions', { count: submissions.length });
    
    return NextResponse.json({
      success: true,
      submissions: submissions
    });
  } catch (error) {
    logger.error('Error fetching test submissions', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test submissions'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    
    const submission = {
      ...body,
      id: `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    };
    
    await db.collection('test_submissions').insertOne(submission);
    
    logger.info('Created test submission', { 
      submissionId: submission.id, 
      studentName: submission.studentName,
      quizTitle: submission.quizTitle 
    });
    
    return NextResponse.json({
      success: true,
      submission: submission
    });
  } catch (error) {
    logger.error('Error creating test submission', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create test submission'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, ...updates } = body;
    const db = await getDatabase();
    
    const result = await db.collection('test_submissions').updateOne(
      { id: submissionId },
      { 
        $set: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Test submission not found'
      }, { status: 404 });
    }
    
    logger.info('Updated test submission', { submissionId, updates });
    
    return NextResponse.json({
      success: true,
      message: 'Test submission updated successfully'
    });
  } catch (error) {
    logger.error('Error updating test submission', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update test submission'
    }, { status: 500 });
  }
}
