import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Token is required'
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    
    // Find the test token
    const testToken = await db.collection('test_tokens').findOne({
      token: token,
      status: 'active'
    });
    
    if (!testToken) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token'
      }, { status: 404 });
    }
    
    // Check if token is expired
    if (testToken.expiresAt && new Date(testToken.expiresAt) < new Date()) {
      // Update token status to expired
      await db.collection('test_tokens').updateOne(
        { id: testToken.id },
        { $set: { status: 'expired', updatedAt: new Date().toISOString() } }
      );
      
      return NextResponse.json({
        success: false,
        error: 'Token has expired'
      }, { status: 410 });
    }
    
    logger.info('Token validated successfully', { 
      tokenId: testToken.id, 
      token: token
    });
    
    return NextResponse.json({
      success: true,
      token: testToken
    });
  } catch (error) {
    logger.error('Error validating test token', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to validate test token'
    }, { status: 500 });
  }
}
