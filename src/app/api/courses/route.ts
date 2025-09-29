import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

// GET /api/courses - Get all courses
export async function GET() {
  try {
    const db = await getDatabase();
    const coursesCollection = db.collection('courses');
    
    // Fetch all courses
    const courses = await coursesCollection
      .find({})
      .sort({ createdAt: -1 }) // Sort by newest first
      .toArray();

    logger.info('Fetched courses', { count: courses.length });

    return NextResponse.json({
      success: true,
      courses: courses
    });
  } catch (error) {
    logger.error('Error fetching courses', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json();
    
    const db = await getDatabase();
    const coursesCollection = db.collection('courses');
    
    // Create new course
    const newCourse = {
      ...courseData,
      id: Date.now().toString(),
      students: 0,
      createdAt: new Date().toISOString()
    };
    
    const result = await coursesCollection.insertOne(newCourse);
    
    if (result.insertedId) {
      logger.info('Course created', { 
        courseId: newCourse.id,
        title: newCourse.title,
        instructor: newCourse.instructor
      });
      
      return NextResponse.json({
        success: true,
        course: newCourse
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create course' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error creating course', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to create course' },
      { status: 500 }
    );
  }
}

// PATCH /api/courses - Update course
export async function PATCH(request: NextRequest) {
  try {
    const { courseId, ...updateData } = await request.json();
    
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

// DELETE /api/courses - Delete course
export async function DELETE(request: NextRequest) {
  try {
    const { courseId } = await request.json();
    
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
