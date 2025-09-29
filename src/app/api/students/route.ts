import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

// GET /api/students - Get all students
export async function GET() {
  try {
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    
    // Fetch all students
    const students = await studentsCollection
      .find({})
      .sort({ enrolledAt: -1 }) // Sort by newest first
      .toArray();

    logger.info('Fetched students', { count: students.length });

    return NextResponse.json({
      success: true,
      students: students
    });
  } catch (error) {
    logger.error('Error fetching students', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const studentData = await request.json();
    
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    
    // Create new student
    const newStudent = {
      ...studentData,
      id: Date.now().toString(),
      enrolledAt: new Date().toISOString()
    };
    
    const result = await studentsCollection.insertOne(newStudent);
    
    if (result.insertedId) {
      logger.info('Student created', { 
        studentId: newStudent.id,
        name: newStudent.name,
        jalId: newStudent.jalId,
        courseId: newStudent.courseId
      });
      
      return NextResponse.json({
        success: true,
        student: newStudent
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create student' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error creating student', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to create student' },
      { status: 500 }
    );
  }
}

// PATCH /api/students - Update student
export async function PATCH(request: NextRequest) {
  try {
    const { studentId, courseId, ...updateData } = await request.json();
    
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    
    // Build query based on provided parameters
    const query: Record<string, string> = {};
    if (studentId) query.name = studentId;
    if (courseId) query.courseId = courseId;
    
    // Update the student
    const result = await studentsCollection.updateOne(
      query,
      { $set: { ...updateData, updatedAt: new Date().toISOString() } }
    );
    
    if (result.modifiedCount > 0) {
      logger.info('Student updated', { studentId, courseId, updateData });
      
      return NextResponse.json({
        success: true,
        message: 'Student updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Student not found or not updated' },
        { status: 404 }
      );
    }
  } catch (error) {
    logger.error('Error updating student', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to update student' },
      { status: 500 }
    );
  }
}

// DELETE /api/students - Delete student
export async function DELETE(request: NextRequest) {
  try {
    const { studentId } = await request.json();
    
    const db = await getDatabase();
    const studentsCollection = db.collection('students');
    
    // Delete the student
    const result = await studentsCollection.deleteOne({ id: studentId });
    
    if (result.deletedCount > 0) {
      logger.info('Student deleted', { studentId });
      
      return NextResponse.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }
  } catch (error) {
    logger.error('Error deleting student', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to delete student' },
      { status: 500 }
    );
  }
}
