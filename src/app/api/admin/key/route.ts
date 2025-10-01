import { NextResponse } from 'next/server';

// GET /api/admin/key - Get admin API key
export async function GET() {
  try {
    const adminKey = process.env.ADMIN_API_KEY;
    
    if (!adminKey) {
      return NextResponse.json(
        { success: false, error: 'Admin API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      adminKey 
    });
  } catch (error) {
    console.error('Error fetching admin key:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch admin key' },
      { status: 500 }
    );
  }
}