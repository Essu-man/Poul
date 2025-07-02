import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/admin';
import { FieldValue } from 'firebase-admin/firestore';

// Get all tasks
export async function GET() {
  try {
    const snapshot = await adminDb.collection('tasks').orderBy('created_at').get();
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Failed to fetch tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTaskData = {
      name: body.name,
      time: body.time,
      priority: body.priority,
      icon: body.icon,
      color: body.color,
      completed: false, // Use boolean for completed status
      created_at: FieldValue.serverTimestamp(),
    };
    const docRef = await adminDb.collection('tasks').add(newTaskData);
    return NextResponse.json({ id: docRef.id, ...newTaskData });
  } catch (error) {
    console.error('Failed to create task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}