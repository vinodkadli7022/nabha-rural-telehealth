import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, patients } from '@/db/schema';
import { eq, like, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';

const VALID_STATUSES = ['scheduled', 'completed', 'cancelled'];

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
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const search = searchParams.get('q');

    if (id) {
      // Get single appointment
      const appointmentId = parseInt(id);
      if (isNaN(appointmentId)) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID'
        }, { status: 400 });
      }

      const appointment = await db
        .select()
        .from(appointments)
        .where(eq(appointments.id, appointmentId))
        .limit(1);

      if (appointment.length === 0) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }

      return NextResponse.json(appointment[0]);
    }

    // List appointments with pagination and search
    const offset = (page - 1) * limit;
    let query = db.select().from(appointments);

    if (search) {
      query = query.where(like(appointments.doctorName, `%${search}%`));
    }

    const results = await query
      .orderBy(desc(appointments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);
  } catch (error) {
    console.error('GET appointments error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await validateAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await request.json();
    const { patientId, doctorName, scheduledFor, status = 'scheduled' } = body;

    // Validate required fields
    if (!doctorName || typeof doctorName !== 'string' || !doctorName.trim()) {
      return NextResponse.json({ 
        error: 'doctorName is required and must be a non-empty string',
        code: 'INVALID_DOCTOR_NAME'
      }, { status: 400 });
    }

    if (!scheduledFor) {
      return NextResponse.json({ 
        error: 'scheduledFor is required',
        code: 'MISSING_SCHEDULED_FOR'
      }, { status: 400 });
    }

    // Validate scheduledFor is valid ISO timestamp
    try {
      new Date(scheduledFor).toISOString();
    } catch {
      return NextResponse.json({ 
        error: 'scheduledFor must be a valid ISO timestamp',
        code: 'INVALID_TIMESTAMP'
      }, { status: 400 });
    }

    // Validate status if provided
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ 
        error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
        code: 'INVALID_STATUS'
      }, { status: 400 });
    }

    // Validate patientId if provided
    let validPatientId = null;
    if (patientId !== undefined && patientId !== null) {
      if (isNaN(parseInt(patientId))) {
        return NextResponse.json({ 
          error: 'patientId must be a valid number',
          code: 'INVALID_PATIENT_ID'
        }, { status: 400 });
      }

      // Check if patient exists
      const patientExists = await db
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.id, parseInt(patientId)))
        .limit(1);

      if (patientExists.length === 0) {
        return NextResponse.json({ 
          error: 'Patient not found',
          code: 'PATIENT_NOT_FOUND'
        }, { status: 400 });
      }
      
      validPatientId = parseInt(patientId);
    }

    const newAppointment = await db
      .insert(appointments)
      .values({
        patientId: validPatientId,
        doctorName: doctorName.trim(),
        scheduledFor,
        status,
        createdAt: new Date().toISOString()
      })
      .returning();

    return NextResponse.json(newAppointment[0], { status: 201 });
  } catch (error) {
    console.error('POST appointment error:', error);
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const appointmentId = parseInt(id);
    const body = await request.json();
    const updates: any = {};

    // Validate fields if provided
    if ('patientId' in body) {
      if (body.patientId !== null && body.patientId !== undefined) {
        if (isNaN(parseInt(body.patientId))) {
          return NextResponse.json({ 
            error: 'patientId must be a valid number',
            code: 'INVALID_PATIENT_ID'
          }, { status: 400 });
        }

        // Check if patient exists
        const patientExists = await db
          .select({ id: patients.id })
          .from(patients)
          .where(eq(patients.id, parseInt(body.patientId)))
          .limit(1);

        if (patientExists.length === 0) {
          return NextResponse.json({ 
            error: 'Patient not found',
            code: 'PATIENT_NOT_FOUND'
          }, { status: 400 });
        }
        
        updates.patientId = parseInt(body.patientId);
      } else {
        updates.patientId = null;
      }
    }

    if ('doctorName' in body) {
      if (!body.doctorName || typeof body.doctorName !== 'string' || !body.doctorName.trim()) {
        return NextResponse.json({ 
          error: 'doctorName must be a non-empty string',
          code: 'INVALID_DOCTOR_NAME'
        }, { status: 400 });
      }
      updates.doctorName = body.doctorName.trim();
    }

    if ('scheduledFor' in body) {
      if (!body.scheduledFor) {
        return NextResponse.json({ 
          error: 'scheduledFor cannot be empty',
          code: 'EMPTY_SCHEDULED_FOR'
        }, { status: 400 });
      }
      
      try {
        new Date(body.scheduledFor).toISOString();
      } catch {
        return NextResponse.json({ 
          error: 'scheduledFor must be a valid ISO timestamp',
          code: 'INVALID_TIMESTAMP'
        }, { status: 400 });
      }
      
      updates.scheduledFor = body.scheduledFor;
    }

    if ('status' in body) {
      if (!VALID_STATUSES.includes(body.status)) {
        return NextResponse.json({ 
          error: `Status must be one of: ${VALID_STATUSES.join(', ')}`,
          code: 'INVALID_STATUS'
        }, { status: 400 });
      }
      updates.status = body.status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ 
        error: 'No valid fields to update',
        code: 'NO_UPDATES'
      }, { status: 400 });
    }

    const updatedAppointment = await db
      .update(appointments)
      .set(updates)
      .where(eq(appointments.id, appointmentId))
      .returning();

    if (updatedAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json(updatedAppointment[0]);
  } catch (error) {
    console.error('PUT appointment error:', error);
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

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: 'Valid ID is required',
        code: 'INVALID_ID'
      }, { status: 400 });
    }

    const deletedAppointment = await db
      .delete(appointments)
      .where(eq(appointments.id, parseInt(id)))
      .returning();

    if (deletedAppointment.length === 0) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Appointment deleted successfully',
      appointment: deletedAppointment[0]
    });
  } catch (error) {
    console.error('DELETE appointment error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error
    }, { status: 500 });
  }
}