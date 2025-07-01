import { NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/admin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || id !== decodedToken.uid) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userDoc = await adminDb.collection('users').doc(id).get();

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userDoc.data());
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { id, email, name, role } = await request.json();
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);

    if (decodedToken.uid !== id) {
      return NextResponse.json({ error: 'Mismatched user ID' }, { status: 403 });
    }

    if (!['employee', 'administrator'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    await adminDb.collection('users').doc(id).set({
      email,
      name,
      role,
      created_at: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating user:', error);
    if (error instanceof Error && 'code' in error && error.code === 'auth/id-token-expired') {
        return NextResponse.json({ error: 'Token expired, please log in again.' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 