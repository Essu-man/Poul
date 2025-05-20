import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: Request,
  { params }: { params: { date: string } }
) {
  try {
    const { date } = params;
    const { error } = await supabase
      .from('egg_production')
      .delete()
      .eq('date', date);

    if (error) throw error;

    return NextResponse.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: 'Failed to delete record' },
      { status: 500 }
    );
  }
}