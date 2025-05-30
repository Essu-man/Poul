import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eggProduction } from '@/lib/schema';
import { format } from 'date-fns';
import { eq, and } from 'drizzle-orm';

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
    if (!data.user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

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
      user_id: data.user_id, // <--- associate with user
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    if (!user_id) {
      return NextResponse.json([], { status: 401 });
    }

    const records = await db
      .select()
      .from(eggProduction)
      .where(eq(eggProduction.user_id, user_id))
      .orderBy(eggProduction.date);
    
    const transformedRecords = records.map(record => ({
      date: record.date,
      peewee: {
        crates: record.peewee_crates ?? 0,
        pieces: record.peewee_pieces ?? 0,
        total: formatTotal(((record.peewee_crates ?? 0) * 30) + (record.peewee_pieces ?? 0))
      },
      small: {
        crates: record.small_crates ?? 0,
        pieces: record.small_pieces ?? 0,
        total: formatTotal(((record.small_crates ?? 0) * 30) + (record.small_pieces ?? 0))
      },
      medium: {
        crates: record.medium_crates ?? 0,
        pieces: record.medium_pieces ?? 0,
        total: formatTotal(((record.medium_crates ?? 0) * 30) + (record.medium_pieces ?? 0))
      },
      large: {
        crates: record.large_crates ?? 0,
        pieces: record.large_pieces ?? 0,
        total: formatTotal(((record.large_crates ?? 0) * 30) + (record.large_pieces ?? 0))
      },
      extraLarge: {
        crates: record.extra_large_crates ?? 0,
        pieces: record.extra_large_pieces ?? 0,
        total: formatTotal(((record.extra_large_crates ?? 0) * 30) + (record.extra_large_pieces ?? 0))
      },
      jumbo: {
        crates: record.jumbo_crates ?? 0,
        pieces: record.jumbo_pieces ?? 0,
        total: formatTotal(((record.jumbo_crates ?? 0) * 30) + (record.jumbo_pieces ?? 0))
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
    const user_id = searchParams.get('user_id');
    if (!date || !user_id) {
      return NextResponse.json(
        { error: 'Date and user_id parameter are required' },
        { status: 400 }
      );
    }

    await db.delete(eggProduction)
      .where(and(eq(eggProduction.date, date), eq(eggProduction.user_id, user_id)));

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
    if (!data.user_id) {
      return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
    }

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
      .where(and(eq(eggProduction.date, data.date), eq(eggProduction.user_id, data.user_id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating egg production:', error);
    return NextResponse.json(
      { error: 'Failed to update egg production data' },
      { status: 500 }
    );
  }
}