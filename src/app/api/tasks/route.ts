import { db } from '@/lib/db';
import { tasks } from '@/lib/schema';
import { NextResponse } from 'next/server';

// Get all tasks
export async function GET() {
  try {
    const taskList = await db.select().from(tasks).orderBy(tasks.created_at);
    return NextResponse.json(taskList);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const [newTask] = await db.insert(tasks).values({
      name: body.name,
      time: body.time,
      priority: body.priority,
      icon: body.icon,
      color: body.color,
      completed: 0,
    }).returning();
    return NextResponse.json(newTask);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}