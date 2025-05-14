import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { eggProduction } from '@/lib/schema';
import { format } from 'date-fns';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    const result = await db.insert(eggProduction).values({
      date: format(new Date(data.date), 'yyyy-MM-dd'),
      peewee_crates: data.peewee.crates,
      peewee_pieces: data.peewee.pieces,
      small_crates: data.small.crates,
      small_pieces: data.small.pieces,
      medium_crates: data.medium.crates,
      medium_pieces: data.medium.pieces,
      large_crates: data.large.crates,
      large_pieces: data.large.pieces,
      extra_large_crates: data.extraLarge.crates,
      extra_large_pieces: data.extraLarge.pieces,
      jumbo_crates: data.jumbo.crates,
      jumbo_pieces: data.jumbo.pieces,
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
    const records = await db.select().from(eggProduction).orderBy(eggProduction.date);
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching egg production:', error);
    return NextResponse.json(
      { error: 'Failed to fetch egg production data' },
      { status: 500 }
    );
  }
}