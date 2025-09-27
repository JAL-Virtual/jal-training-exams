import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET /api/staff/role - Get current user's role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const staffCollection = db.collection('staff');
    
    const staffMember = await staffCollection.findOne({ apiKey });
    
    if (!staffMember) {
      return NextResponse.json({ 
        success: true, 
        role: null 
      });
    }

    return NextResponse.json({ 
      success: true, 
      role: staffMember.role,
      staff: staffMember
    });
  } catch (error) {
    console.error('Error fetching user role:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}
