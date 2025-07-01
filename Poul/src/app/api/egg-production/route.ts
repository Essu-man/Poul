import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/admin';
import { format } from 'date-fns';

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

async function verifyUser(request: Request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return { error: 'Unauthorized', status: 401, uid: null };
  }
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return { uid: decodedToken.uid, error: null, status: 200 };
  } catch (error) {
    return { error: 'Invalid token', status: 403, uid: null };
  }
}

export async function POST(request: Request) {
  const { uid, error, status } = await verifyUser(request);
  if (error) {
    return NextResponse.json({ error }, { status });
  }

  try {
    const data = await request.json();
    
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

    const formattedDate = format(new Date(data.date), 'yyyy-MM-dd');

    const newRecord = {
      user_id: uid,
      date: formattedDate,
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
      created_at: new Date().toISOString()
    };
    
    const docRef = await adminDb.collection('egg-production').add(newRecord);

    return NextResponse.json({ id: docRef.id, ...newRecord });
  } catch (error) {
    console.error('Error saving egg production:', error);
    return NextResponse.json(
      { error: 'Failed to save egg production data' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
    const { uid, error, status } = await verifyUser(request);
    if (error) {
        return NextResponse.json({ error }, { status });
    }

  try {
    const snapshot = await adminDb.collection('egg-production')
      .where('user_id', '==', uid)
      .orderBy('date')
      .get();
    
    if (snapshot.empty) {
      return NextResponse.json([]);
    }

    const transformedRecords = snapshot.docs.map(doc => {
      const record = doc.data();
      return {
        id: doc.id,
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
      };
    });

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
    const { uid, error, status } = await verifyUser(request);
    if (error) {
        return NextResponse.json({ error }, { status });
    }

  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      );
    }
    
    const snapshot = await adminDb.collection('egg-production')
      .where('user_id', '==', uid)
      .where('date', '==', date)
      .limit(1)
      .get();
      
    if (snapshot.empty) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const docToDelete = snapshot.docs[0];
    await docToDelete.ref.delete();

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
    const { uid, error, status } = await verifyUser(request);
    if (error) {
        return NextResponse.json({ error }, { status });
    }

  try {
    const data = await request.json();
    if (!data.date) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }

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

    const updatedData = {
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
      };

    const snapshot = await adminDb.collection('egg-production')
      .where('user_id', '==', uid)
      .where('date', '==', data.date)
      .limit(1)
      .get();
      
    if (snapshot.empty) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const docToUpdate = snapshot.docs[0];
    await docToUpdate.ref.update(updatedData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating egg production:', error);
    return NextResponse.json(
      { error: 'Failed to update egg production data' },
      { status: 500 }
    );
  }
}