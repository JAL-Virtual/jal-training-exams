import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const examiners = await db.collection('examiners').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      examiners: examiners.map(examiner => ({
        id: examiner._id.toString(),
        jalId: examiner.jalId,
        name: examiner.name,
        active: examiner.active,
        createdAt: examiner.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching examiners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch examiners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jalId, name } = body;

    if (!jalId || !name) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (JAL ID and Name)' },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    
    // Check if examiner with same JAL ID already exists
    const existingExaminer = await db.collection('examiners').findOne({ jalId });
    if (existingExaminer) {
      return NextResponse.json(
        { success: false, error: 'Examiner with this JAL ID already exists' },
        { status: 400 }
      );
    }

    const examiner = {
      jalId,
      name,
      active: true,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('examiners').insertOne(examiner);

    return NextResponse.json({
      success: true,
      examiner: {
        id: result.insertedId.toString(),
        ...examiner
      }
    });
  } catch (error) {
    console.error('Error adding examiner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add examiner' },
      { status: 500 }
    );
  }
}
