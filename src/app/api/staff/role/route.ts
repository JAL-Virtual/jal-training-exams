import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// GET /api/staff/role - Get current user's role
export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/staff/role - Starting request');
    
    // Check if DATABASE_URL is set
    if (!process.env.DATABASE_URL) {
      console.error('DATABASE_URL environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Database configuration missing' },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    console.log('GET /api/staff/role - API Key:', apiKey?.substring(0, 8) + '...');

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const staffCollection = db.collection('staff');
    
    const staffMember = await staffCollection.findOne({ apiKey });
    
    console.log('GET /api/staff/role - Staff member found:', !!staffMember);
    
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
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user role' },
      { status: 500 }
    );
  }
}
