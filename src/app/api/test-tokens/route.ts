import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const db = await getDatabase();
    const tokens = await db.collection('test_tokens').find({}).toArray();
    
    logger.info('Fetched test tokens', { count: tokens.length });
    
    return NextResponse.json({
      success: true,
      testTokens: tokens
    });
  } catch (error) {
    logger.error('Error fetching test tokens', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch test tokens'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const db = await getDatabase();
    
    const tokenString = generateTokenString();
    
    const testToken = {
      ...body,
      id: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      token: tokenString,
      status: 'active',
      createdAt: new Date().toISOString()
    };
    
    await db.collection('test_tokens').insertOne(testToken);
    
    logger.info('Created test token', { tokenId: testToken.id, token: tokenString });
    
    return NextResponse.json({
      success: true,
      token: testToken
    });
  } catch (error) {
    logger.error('Error creating test token', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to create test token'
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { tokenId, ...updates } = body;
    const db = await getDatabase();
    
    const result = await db.collection('test_tokens').updateOne(
      { id: tokenId },
      { 
        $set: {
          ...updates,
          updatedAt: new Date().toISOString()
        }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Test token not found'
      }, { status: 404 });
    }
    
    logger.info('Updated test token', { tokenId, updates });
    
    return NextResponse.json({
      success: true,
      message: 'Test token updated successfully'
    });
  } catch (error) {
    logger.error('Error updating test token', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({
      success: false,
      error: 'Failed to update test token'
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tokenId = searchParams.get('id');
    
    if (!tokenId) {
      return NextResponse.json({
        success: false,
        error: 'Token ID is required'
      }, { status: 400 });
    }
    
    const db = await getDatabase();
    const result = await db.collection('test_tokens').deleteOne({ id: tokenId });
    
    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        error: 'Test token not found'
      }, { status: 404 });
    }
    
    logger.info('Deleted test token', { tokenId });
    
    return NextResponse.json({
      success: true,
      message: 'Test token deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting test token', {
      message: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json({ 
      success: false,
      error: 'Failed to delete test token'
    }, { status: 500 });
  }
}

function generateTokenString(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
