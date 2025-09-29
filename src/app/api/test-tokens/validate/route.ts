import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const studentName = searchParams.get('studentName');
    
    if (!token || !studentName) {
      return NextResponse.json({
        success: false,
        error: 'Token and student name are required'
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    // Find the test token
    const testToken = await db.collection('test_tokens').findOne({
      token: token,
      status: { $in: ['active', 'assigned'] },
      $or: [
        { assignedStudentName: studentName },
        { status: 'active' }
      ]
    });
    
    if (!testToken) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token'
      }, { status: 404 });
    }
    
    // Check if token is expired
    if (testToken.expiresAt && new Date(testToken.expiresAt) < new Date()) {
      // Update token status to expired
      await db.collection('test_tokens').updateOne(
        { id: testToken.id },
        { $set: { status: 'expired', updatedAt: new Date().toISOString() } }
      );
      
      return NextResponse.json({
        success: false,
        error: 'Token has expired'
      }, { status: 410 });
    }
    
    // Get the associated quiz
    const quiz = await db.collection('quizzes').findOne({
      id: testToken.quizId,
      status: 'published'
    });
    
    if (!quiz) {
      return NextResponse.json({
        success: false,
        error: 'Quiz not found or not available'
      }, { status: 404 });
    }
    
    logger.info('Token validated successfully', { 
      tokenId: testToken.id, 
      studentName, 
      quizId: quiz.id 
    });
    
    return NextResponse.json({
      success: true,
      token: testToken,
      quiz: quiz
    });
  } catch (error) {
    logger.error('Error validating test token', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate test token'
    }, { status: 500 });
  }
}
