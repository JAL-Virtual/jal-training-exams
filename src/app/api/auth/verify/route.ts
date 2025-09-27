import { NextRequest, NextResponse } from 'next/server';

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

    // For now, we'll simulate API verification
    // In a real implementation, you would call the actual JAL Virtual API
    // This is a placeholder that accepts any non-empty API key
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock user data based on API key
    const mockUser = {
      id: 'user_' + Date.now(),
      name: 'JAL Staff Member',
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
