import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { records, patients } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// Helper function to validate bearer token
async function validateAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authHeader.split(' ')[1];
    const session = await auth.api.getSession({
      headers: { authorization: `Bearer ${token}` }
    });
    
    return session?.user || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (id) {
      // Get single record
      const idNum = parseInt(id);
      if (isNaN(idNum)) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const record = await db
        .select()
        .from(records)
        .where(eq(records.id, idNum))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List all records with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;
    const search = searchParams.get('q');

    let query = db.select().from(records);

    if (search) {
      query = query.where(
        or(
          like(records.diagnosis, `%${search}%`),
          like(records.notes, `%${search}%`)
        )
      );
    }

    const results = await query
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication for write operations
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, diagnosis, notes, prescription } = body;

    // Validation
    if (!patientId || isNaN(parseInt(patientId.toString()))) {
      return NextResponse.json({
        error: "Patient ID is required and must be a valid integer",
        code: "MISSING_PATIENT_ID"
      }, { status: 400 });
    }

    if (!diagnosis || typeof diagnosis !== 'string' || !diagnosis.trim()) {
      return NextResponse.json({
        error: "Diagnosis is required and must be a non-empty string",
        code: "MISSING_DIAGNOSIS"
      }, { status: 400 });
    }

    // Check if patient exists
    const patientExists = await db
      .select({ id: patients.id })
      .from(patients)
      .where(eq(patients.id, parseInt(patientId.toString())))
      .limit(1);

    if (patientExists.length === 0) {
      return NextResponse.json({
        error: "Patient not found",
        code: "PATIENT_NOT_FOUND"
      }, { status: 400 });
    }

    // Insert record
    const now = new Date().toISOString();
    const newRecord = await db.insert(records)
      .values({
        patientId: parseInt(patientId.toString()),
        diagnosis: diagnosis.trim(),
        notes: notes ? notes.trim() : null,
        prescription: prescription ? prescription.trim() : null,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: "Record ID is required",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const body = await request.json();
    let updateValues: any = {};

    if ('patientId' in body) {
      if (isNaN(parseInt(body.patientId.toString()))) {
        return NextResponse.json({
          error: "Patient ID must be a valid integer",
          code: "INVALID_PATIENT_ID"
        }, { status: 400 });
      }
      
      // Check if patient exists
      const patientExists = await db
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.id, parseInt(body.patientId.toString())))
        .limit(1);

      if (patientExists.length === 0) {
        return NextResponse.json({
          error: "Patient not found",
          code: "PATIENT_NOT_FOUND"
        }, { status: 400 });
      }
      
      updateValues.patientId = parseInt(body.patientId.toString());
    }

    if ('diagnosis' in body) {
      if (typeof body.diagnosis !== 'string' || !body.diagnosis.trim()) {
        return NextResponse.json({
          error: "Diagnosis must be a non-empty string",
          code: "INVALID_DIAGNOSIS"
        }, { status: 400 });
      }
      updateValues.diagnosis = body.diagnosis.trim();
    }

    if ('notes' in body) {
      updateValues.notes = body.notes ? body.notes.trim() : null;
    }

    if ('prescription' in body) {
      updateValues.prescription = body.prescription ? body.prescription.trim() : null;
    }

    const updatedRecord = await db
      .update(records)
      .set(updateValues)
      .where(eq(records.id, idNum))
      .returning();

    if (updatedRecord.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRecord[0]);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: "Record ID is required",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    const idNum = parseInt(id);
    if (isNaN(idNum)) {
      return NextResponse.json({
        error: "Valid ID is required",
        code: "INVALID_ID"
      }, { status: 400 });
    }

    const deletedRecord = await db
      .delete(records)
      .where(eq(records.id, idNum))
      .returning();

    if (deletedRecord.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: "Record successfully deleted",
      record: deletedRecord[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}