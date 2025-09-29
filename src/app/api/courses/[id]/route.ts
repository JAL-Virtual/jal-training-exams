import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

// DELETE /api/courses/[id] - Delete a specific course
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    
    const db = await getDatabase();
    const coursesCollection = db.collection('courses');
    
    // Delete the course
    const result = await coursesCollection.deleteOne({ id: courseId });
    
    if (result.deletedCount > 0) {
      logger.info('Course deleted', { courseId });
      
      return NextResponse.json({
        success: true,
        message: 'Course deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    logger.error('Error deleting course', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete course' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses/[id] - Update a specific course
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const updateData = await request.json();
    
    const db = await getDatabase();
    const coursesCollection = db.collection('courses');
    
    // Update the course
    const result = await coursesCollection.updateOne(
      { id: courseId },
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );
    
    if (result.modifiedCount > 0) {
      logger.info('Course updated', { courseId, updateData });
      
      return NextResponse.json({
        success: true,
        message: 'Course updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Course not found or not updated' },
        { status: 404 }
      );
    }
  } catch (error) {
    logger.error('Error updating course', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to update course' },
      { status: 500 }
    );
  }
}
