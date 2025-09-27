import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET /api/staff/roles - Get all available roles and their permissions
export async function GET() {
  try {
    const roles = {
      Trainer: {
        name: 'Trainer',
        description: 'Can manage training sessions and view training department',
        permissions: ['training.view', 'training.create', 'training.update', 'control.view'],
        departments: ['TRAINING DEPARTMENT', 'STAFF DEPARTMENT (Training, Pickup Training, Control)']
      },
      Examiner: {
        name: 'Examiner',
        description: 'Can manage examinations and view exam department',
        permissions: ['examination.view', 'examination.create', 'examination.update', 'control.view'],
        departments: ['EXAM DEPARTMENT', 'STAFF DEPARTMENT (Examination, Control)']
      },
      Admin: {
        name: 'Admin',
        description: 'Full access to all departments and management features',
        permissions: ['*'],
        departments: ['All Departments', 'MANAGEMENT DEPARTMENT']
      }
    };

    return NextResponse.json({ 
      success: true, 
      roles 
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

// POST /api/staff/roles - Update staff member role
export async function POST(request: NextRequest) {
  try {
    const { staffId, newRole } = await request.json();

    if (!staffId || !newRole) {
      return NextResponse.json(
        { success: false, error: 'Staff ID and new role are required' },
        { status: 400 }
      );
    }

    const validRoles = ['Trainer', 'Examiner', 'Admin'];
    if (!validRoles.includes(newRole)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role. Must be Trainer, Examiner, or Admin' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const staffCollection = db.collection('staff');

    // Define role permissions
    const rolePermissions = {
      Trainer: ['training.view', 'training.create', 'training.update', 'control.view'],
      Examiner: ['examination.view', 'examination.create', 'examination.update', 'control.view'],
      Admin: ['*'] // Admin has all permissions
    };

    const updateData = {
      role: newRole,
      permissions: rolePermissions[newRole as keyof typeof rolePermissions] || [],
      lastActive: new Date().toISOString()
    };

    const result = await staffCollection.updateOne(
      { id: staffId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    const updatedStaff = await staffCollection.findOne({ id: staffId });
    
    return NextResponse.json({ 
      success: true, 
      staff: updatedStaff,
      message: `Staff member role updated to ${newRole}`
    });
  } catch (error) {
    console.error('Error updating staff role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update staff role' },
      { status: 500 }
    );
  }
}
