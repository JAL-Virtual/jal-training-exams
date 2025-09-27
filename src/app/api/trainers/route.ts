import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const db = await getDatabase();
    const trainers = await db.collection('trainers').find({}).sort({ createdAt: -1 }).toArray();
    
    return NextResponse.json({
      success: true,
      trainers: trainers.map(trainer => ({
        id: trainer._id.toString(),
        jalId: trainer.jalId,
        name: trainer.name,
        active: trainer.active,
        createdAt: trainer.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching trainers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trainers' },
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
    
    // Check if trainer with same JAL ID already exists
    const existingTrainer = await db.collection('trainers').findOne({ jalId });
    if (existingTrainer) {
      return NextResponse.json(
        { success: false, error: 'Trainer with this JAL ID already exists' },
        { status: 400 }
      );
    }

    const trainer = {
      jalId,
      name,
      active: true,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('trainers').insertOne(trainer);

    return NextResponse.json({
      success: true,
      trainer: {
        id: result.insertedId.toString(),
        ...trainer
      }
    });
  } catch (error) {
    console.error('Error adding trainer:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add trainer' },
      { status: 500 }
    );
  }
}
