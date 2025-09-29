import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const db = await getDatabase();
    const quizzes = await db.collection('quizzes').find({}).toArray();
    
    logger.info('Fetched quizzes', { count: quizzes.length });
    
    return NextResponse.json({
      success: true,
      quizzes: quizzes
    });
  } catch (error) {
    logger.error('Error fetching quizzes', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch quizzes'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    
    const quiz = {
      ...body,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      questions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    await db.collection('quizzes').insertOne(quiz);
    
    logger.info('Created quiz', { quizId: quiz.id, title: quiz.title });
    
    return NextResponse.json({
      success: true,
      quiz: quiz
    });
  } catch (error) {
    logger.error('Error creating quiz', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create quiz'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { quizId, ...updates } = body;
    const db = await getDatabase();
    
    const result = await db.collection('quizzes').updateOne(
      { id: quizId },
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
        error: 'Quiz not found'
      }, { status: 404 });
    }
    
    logger.info('Updated quiz', { quizId, updates });
    
    return NextResponse.json({
      success: true,
      message: 'Quiz updated successfully'
    });
  } catch (error) {
    logger.error('Error updating quiz', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update quiz'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quizId = searchParams.get('id');
    
    if (!quizId) {
      return NextResponse.json({
        success: false,
        error: 'Quiz ID is required'
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    const result = await db.collection('quizzes').deleteOne({ id: quizId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Quiz not found'
      }, { status: 404 });
    }
    
    logger.info('Deleted quiz', { quizId });
    
    return NextResponse.json({
      success: true,
      message: 'Quiz deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting quiz', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to delete quiz'
    }, { status: 500 });
  }
}
