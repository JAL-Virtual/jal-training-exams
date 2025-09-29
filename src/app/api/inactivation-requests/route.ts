import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { logger } from '@/lib/logger';

// GET /api/inactivation-requests - Get all inactivation requests
export async function GET() {
  try {
    const db = await getDatabase();
    const inactivationRequestsCollection = db.collection('inactivation_requests');
    
    // Fetch all inactivation requests
    const requests = await inactivationRequestsCollection
      .find({})
      .sort({ requestedAt: -1 }) // Sort by newest first
      .toArray();

    logger.info('Fetched inactivation requests', { count: requests.length });

    return NextResponse.json({
      success: true,
      requests: requests
    });
  } catch (error) {
    logger.error('Error fetching inactivation requests', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to fetch inactivation requests' },
      { status: 500 }
    );
  }
}

// POST /api/inactivation-requests - Create a new inactivation request
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json();
    
    const db = await getDatabase();
    const inactivationRequestsCollection = db.collection('inactivation_requests');
    
    // Create new inactivation request
    const newRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'pending',
      requestedAt: new Date().toISOString()
    };
    
    const result = await inactivationRequestsCollection.insertOne(newRequest);
    
    if (result.insertedId) {
      logger.info('Inactivation request created', { 
        requestId: newRequest.id,
        userId: newRequest.userId,
        userType: newRequest.userType
      });
      
      return NextResponse.json({
        success: true,
        request: newRequest
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to create inactivation request' },
        { status: 500 }
      );
    }
  } catch (error) {
    logger.error('Error creating inactivation request', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to create inactivation request' },
      { status: 500 }
    );
  }
}

// PATCH /api/inactivation-requests - Update inactivation request status
export async function PATCH(request: NextRequest) {
  try {
    const { requestId, status, adminComments, processedBy } = await request.json();
    
    const db = await getDatabase();
    const inactivationRequestsCollection = db.collection('inactivation_requests');
    
    // Update the request
    const updateData = {
      status,
      adminComments,
      processedBy,
      processedAt: new Date().toISOString()
    };
    
    const result = await inactivationRequestsCollection.updateOne(
      { id: requestId },
      { $set: updateData }
    );
    
    if (result.modifiedCount > 0) {
      logger.info('Inactivation request updated', { 
        requestId,
        status,
        processedBy
      });
      
      return NextResponse.json({
        success: true,
        message: 'Request updated successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Request not found or not updated' },
        { status: 404 }
      );
    }
  } catch (error) {
    logger.error('Error updating inactivation request', { 
      message: error instanceof Error ? error.message : String(error) 
    });
    
    return NextResponse.json(
      { success: false, error: 'Failed to update inactivation request' },
      { status: 500 }
    );
  }
}
