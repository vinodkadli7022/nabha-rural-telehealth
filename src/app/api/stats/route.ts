import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, records, appointments, inventory } from '@/db/schema';
import { count } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const [patientsCount] = await db.select({ count: count() }).from(patients);
    const [recordsCount] = await db.select({ count: count() }).from(records);
    const [appointmentsCount] = await db.select({ count: count() }).from(appointments);
    const [inventoryCount] = await db.select({ count: count() }).from(inventory);

    return NextResponse.json({
      patients: patientsCount.count,
      records: recordsCount.count,
      appointments: appointmentsCount.count,
      inventory: inventoryCount.count
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}