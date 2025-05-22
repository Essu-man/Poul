import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eggProduction } from '@/lib/schema';
import { format } from 'date-fns';
import { eq } from 'drizzle-orm';

// Helper function to calculate crates and remaining pieces
function calculateCratesAndPieces(totalPieces: number) {
  const crates = Math.floor(totalPieces / 30);
  const pieces = totalPieces % 30;
  return { crates, pieces };
}

// Helper function to format crates and pieces with leading zeros
function formatTotal(total: number) {
  const { crates, pieces } = calculateCratesAndPieces(total);
  return `${crates.toString().padStart(2, '0')}/${pieces.toString().padStart(2, '0')}`;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Calculate crates and pieces for each egg size
    const peeweeTotal = (data.peewee.crates * 30) + data.peewee.pieces;
    const peeweeCalc = calculateCratesAndPieces(peeweeTotal);
    
    const smallTotal = (data.small.crates * 30) + data.small.pieces;
    const smallCalc = calculateCratesAndPieces(smallTotal);
    
    const mediumTotal = (data.medium.crates * 30) + data.medium.pieces;
    const mediumCalc = calculateCratesAndPieces(mediumTotal);
    
    const largeTotal = (data.large.crates * 30) + data.large.pieces;
    const largeCalc = calculateCratesAndPieces(largeTotal);
    
    const extraLargeTotal = (data.extraLarge.crates * 30) + data.extraLarge.pieces;
    const extraLargeCalc = calculateCratesAndPieces(extraLargeTotal);
    
    const jumboTotal = (data.jumbo.crates * 30) + data.jumbo.pieces;
    const jumboCalc = calculateCratesAndPieces(jumboTotal);

    const result = await db.insert(eggProduction).values({
      date: format(new Date(data.date), 'yyyy-MM-dd'),
      peewee_crates: peeweeCalc.crates,
      peewee_pieces: peeweeCalc.pieces,
      small_crates: smallCalc.crates,
      small_pieces: smallCalc.pieces,
      medium_crates: mediumCalc.crates,
      medium_pieces: mediumCalc.pieces,
      large_crates: largeCalc.crates,
      large_pieces: largeCalc.pieces,
      extra_large_crates: extraLargeCalc.crates,
      extra_large_pieces: extraLargeCalc.pieces,
      jumbo_crates: jumboCalc.crates,
      jumbo_pieces: jumboCalc.pieces,
    }).returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error saving egg production:', error);
    return NextResponse.json(
      { error: 'Failed to save egg production data' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const records = await db
      .select()
      .from(eggProduction)
      .orderBy(eggProduction.date);
    
    const transformedRecords = records.map(record => ({
      date: record.date,
      peewee: {
        crates: record.peewee_crates,
        pieces: record.peewee_pieces,
        total: formatTotal((record.peewee_crates * 30) + record.peewee_pieces)
      },
      small: {
        crates: record.small_crates,
        pieces: record.small_pieces,
        total: formatTotal((record.small_crates * 30) + record.small_pieces)
      },
      medium: {
        crates: record.medium_crates,
        pieces: record.medium_pieces,
        total: formatTotal((record.medium_crates * 30) + record.medium_pieces)
      },
      large: {
        crates: record.large_crates,
        pieces: record.large_pieces,
        total: formatTotal((record.large_crates * 30) + record.large_pieces)
      },
      extraLarge: {
        crates: record.extra_large_crates,
        pieces: record.extra_large_pieces,
        total: formatTotal((record.extra_large_crates * 30) + record.extra_large_pieces)
      },
      jumbo: {
        crates: record.jumbo_crates,
        pieces: record.jumbo_pieces,
        total: formatTotal((record.jumbo_crates * 30) + record.jumbo_pieces)
      }
    }));

    return NextResponse.json(transformedRecords);
  } catch (error) {
    console.error('Error fetching egg production:', error);
    return NextResponse.json(
      { error: 'Failed to fetch egg production data' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }

    await db.delete(eggProduction)
      .where(eq(eggProduction.date, date));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting egg production:', error);
    return NextResponse.json(
      { error: 'Failed to delete egg production data' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    // Calculate crates and pieces for each egg size
    const peeweeTotal = (data.peewee.crates * 30) + data.peewee.pieces;
    const peeweeCalc = calculateCratesAndPieces(peeweeTotal);
    
    const smallTotal = (data.small.crates * 30) + data.small.pieces;
    const smallCalc = calculateCratesAndPieces(smallTotal);
    
    const mediumTotal = (data.medium.crates * 30) + data.medium.pieces;
    const mediumCalc = calculateCratesAndPieces(mediumTotal);
    
    const largeTotal = (data.large.crates * 30) + data.large.pieces;
    const largeCalc = calculateCratesAndPieces(largeTotal);
    
    const extraLargeTotal = (data.extraLarge.crates * 30) + data.extraLarge.pieces;
    const extraLargeCalc = calculateCratesAndPieces(extraLargeTotal);
    
    const jumboTotal = (data.jumbo.crates * 30) + data.jumbo.pieces;
    const jumboCalc = calculateCratesAndPieces(jumboTotal);

    await db.update(eggProduction)
      .set({
        peewee_crates: peeweeCalc.crates,
        peewee_pieces: peeweeCalc.pieces,
        small_crates: smallCalc.crates,
        small_pieces: smallCalc.pieces,
        medium_crates: mediumCalc.crates,
        medium_pieces: mediumCalc.pieces,
        large_crates: largeCalc.crates,
        large_pieces: largeCalc.pieces,
        extra_large_crates: extraLargeCalc.crates,
        extra_large_pieces: extraLargeCalc.pieces,
        jumbo_crates: jumboCalc.crates,
        jumbo_pieces: jumboCalc.pieces,
      })
      .where(eq(eggProduction.date, data.date));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating egg production:', error);
    return NextResponse.json(
      { error: 'Failed to update egg production data' },
      { status: 500 }
    );
  }
}