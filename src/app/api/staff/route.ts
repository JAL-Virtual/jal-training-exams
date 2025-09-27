import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { CreateStaffMemberRequest, UpdateStaffMemberRequest } from '@/types/staff';

// GET /api/staff - Get all staff members
export async function GET() {
  try {
    const db = await getDatabase();
    const staffCollection = db.collection('staff');
    
    const staffMembers = await staffCollection.find({}).toArray();
    
    // Convert ObjectId to string for JSON response
    const formattedStaff = staffMembers.map(staff => ({
      ...staff,
      _id: staff._id?.toString()
    }));
    
    return NextResponse.json({ 
      success: true, 
      staff: formattedStaff 
    });
  } catch (error) {
    console.error('Error fetching staff members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch staff members' },
      { status: 500 }
    );
  }
}

// POST /api/staff - Add a new staff member
export async function POST(request: NextRequest) {
  try {
    const body: CreateStaffMemberRequest = await request.json();
    const { apiKey, role, name } = body;

    if (!apiKey || !role) {
      return NextResponse.json(
        { success: false, error: 'API Key and Role are required' },
        { status: 400 }
      );
    }

    // Verify the API key by calling the JAL Virtual API directly
    try {
      const jalApiResponse = await fetch('https://jalvirtual.com/api/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-API-Key': apiKey,
        },
      });

      if (!jalApiResponse.ok) {
        // Check if it's the admin key
        if (apiKey === '29e2bb1d4ae031ed47b6') {
          // Admin key is valid, continue
        } else {
          return NextResponse.json(
            { success: false, error: 'Invalid API key' },
            { status: 400 }
          );
        }
      }
    } catch (apiError) {
      // Check if it's the admin key
      if (apiKey === '29e2bb1d4ae031ed47b6') {
        // Admin key is valid, continue
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 400 }
        );
      }
    }

    const db = await getDatabase();
    const staffCollection = db.collection('staff');

    // Check if staff member already exists
    const existingStaff = await staffCollection.findOne({ apiKey });
    if (existingStaff) {
      return NextResponse.json(
        { success: false, error: 'Staff member with this API key already exists' },
        { status: 400 }
      );
    }

    // Define role permissions
    const rolePermissions = {
      Trainer: ['training.view', 'training.create', 'training.update', 'control.view'],
      Examiner: ['examination.view', 'examination.create', 'examination.update', 'control.view'],
      Admin: ['*'] // Admin has all permissions
    };

    const staffMember = {
      id: Date.now().toString(),
      apiKey,
      role,
      name: name || 'Unknown',
      addedDate: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      permissions: rolePermissions[role] || [],
      status: 'active'
    };

    const result = await staffCollection.insertOne(staffMember);
    
    return NextResponse.json({ 
      success: true, 
      staff: { ...staffMember, _id: result.insertedId.toString() }
    });
  } catch (error) {
    console.error('Error adding staff member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add staff member' },
      { status: 500 }
    );
  }
}

// PUT /api/staff - Update a staff member
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body: UpdateStaffMemberRequest = await request.json();

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Staff member ID is required' },
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

    const updateData: Record<string, string | string[]> = {
      lastActive: new Date().toISOString()
    };

    if (body.role) {
      updateData.role = body.role;
      updateData.permissions = rolePermissions[body.role] || [];
    }
    if (body.name) updateData.name = body.name;
    if (body.status) updateData.status = body.status;
    if (body.permissions) updateData.permissions = body.permissions;

    const result = await staffCollection.updateOne(
      { id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    const updatedStaff = await staffCollection.findOne({ id });
    
    return NextResponse.json({ 
      success: true, 
      staff: updatedStaff ? { ...updatedStaff, _id: updatedStaff._id?.toString() } : null
    });
  } catch (error) {
    console.error('Error updating staff member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update staff member' },
      { status: 500 }
    );
  }
}

// DELETE /api/staff - Remove a staff member
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Staff member ID is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const staffCollection = db.collection('staff');

    const result = await staffCollection.deleteOne({ id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Staff member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing staff member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove staff member' },
      { status: 500 }
    );
  }
}
