import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { patients } from '@/db/schema';
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
      // Get single patient
      const idNum = parseInt(id);
      if (isNaN(idNum)) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const patient = await db
        .select()
        .from(patients)
        .where(eq(patients.id, idNum))
        .limit(1);

      if (patient.length === 0) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }

      return NextResponse.json(patient[0]);
    }

    // List all patients with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;
    const search = searchParams.get('q');

    let query = db.select().from(patients);

    if (search) {
      query = query.where(
        or(
          like(patients.name, `%${search}%`),
          like(patients.village, `%${search}%`),
          like(patients.phone, `%${search}%`)
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
    const { name, age, village, gender, phone } = body;

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({
        error: "Name is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    if (!village || typeof village !== 'string' || !village.trim()) {
      return NextResponse.json({
        error: "Village is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    if (!age || isNaN(parseInt(age.toString())) || parseInt(age.toString()) <= 0) {
      return NextResponse.json({
        error: "Age is required and must be a positive integer",
        code: "INVALID_AGE"
      }, { status: 400 });
    }

    // Insert patient
    const now = new Date().toISOString();
    const newPatient = await db.insert(patients)
      .values({
        name: name.trim(),
        age: parseInt(age.toString()),
        village: village.trim(),
        gender: gender || 'other',
        phone: phone ? phone.trim() : null,
        createdAt: now,
      })
      .returning();

    return NextResponse.json(newPatient[0], { status: 201 });
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
        error: "Patient ID is required",
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

    if ('name' in body) {
      if (typeof body.name !== 'string' || !body.name.trim()) {
        return NextResponse.json({
          error: "Name must be a non-empty string",
          code: "INVALID_NAME"
        }, { status: 400 });
      }
      updateValues.name = body.name.trim();
    }

    if ('age' in body) {
      if (isNaN(parseInt(body.age.toString())) || parseInt(body.age.toString()) <= 0) {
        return NextResponse.json({
          error: "Age must be a positive integer",
          code: "INVALID_AGE"
        }, { status: 400 });
      }
      updateValues.age = parseInt(body.age.toString());
    }

    if ('village' in body) {
      if (typeof body.village !== 'string' || !body.village.trim()) {
        return NextResponse.json({
          error: "Village must be a non-empty string",
          code: "INVALID_VILLAGE"
        }, { status: 400 });
      }
      updateValues.village = body.village.trim();
    }

    if ('gender' in body) {
      updateValues.gender = body.gender;
    }

    if ('phone' in body) {
      updateValues.phone = body.phone ? body.phone.trim() : null;
    }

    const updatedPatient = await db
      .update(patients)
      .set(updateValues)
      .where(eq(patients.id, idNum))
      .returning();

    if (updatedPatient.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json(updatedPatient[0]);
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
        error: "Patient ID is required",
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

    const deletedPatient = await db
      .delete(patients)
      .where(eq(patients.id, idNum))
      .returning();

    if (deletedPatient.length === 0) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: "Patient successfully deleted",
      patient: deletedPatient[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}