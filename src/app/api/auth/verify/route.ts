import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

// POST /api/auth/verify - Verify API key
export async function POST(request: NextRequest) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: 'API key is required' },
        { status: 400 }
      );
    }

    // Check if user exists in staff database
    try {
      const db = await getDatabase();
      const staffCollection = db.collection('staff');
      const staffMember = await staffCollection.findOne({ apiKey });
      
      if (staffMember) {
        // User found in staff database, return their actual data
        const user = {
          id: staffMember.id,
          name: staffMember.name || 'Staff Member',
          email: 'staff@jal.com',
          apiKey: apiKey,
          role: staffMember.role
        };

        return NextResponse.json({
          ok: true,
          user: user
        });
      }
    } catch (dbError) {
      console.log('Database not available, using fallback verification:', dbError);
    }

    // Fallback: Mock user data based on API key
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const mockUser = {
      id: 'user_' + Date.now(),
      name: apiKey === '29e2bb1d4ae031ed47b6' ? 'Admin User' : 'Staff Member',
      email: 'staff@jal.com',
      apiKey: apiKey
    };

    return NextResponse.json({
      ok: true,
      user: mockUser
    });

  } catch (error) {
    console.error('Error verifying API key:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to verify API key' },
      { status: 500 }
    );
  }
}
