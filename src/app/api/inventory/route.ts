import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { inventory } from '@/db/schema';
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
      // Get single inventory item
      const idNum = parseInt(id);
      if (isNaN(idNum)) {
        return NextResponse.json({
          error: "Valid ID is required",
          code: "INVALID_ID"
        }, { status: 400 });
      }

      const item = await db
        .select()
        .from(inventory)
        .where(eq(inventory.id, idNum))
        .limit(1);

      if (item.length === 0) {
        return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
      }

      return NextResponse.json(item[0]);
    }

    // List inventory items with pagination and search
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);
    const offset = (page - 1) * limit;
    const search = searchParams.get('q');

    let query = db.select().from(inventory);

    if (search) {
      query = query.where(
        or(
          like(inventory.medicineName, `%${search}%`),
          like(inventory.pharmacyName, `%${search}%`)
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
    const { medicineName, pharmacyName, stock } = body;

    // Validation
    if (!medicineName || typeof medicineName !== 'string' || !medicineName.trim()) {
      return NextResponse.json({
        error: "Medicine name is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    if (!pharmacyName || typeof pharmacyName !== 'string' || !pharmacyName.trim()) {
      return NextResponse.json({
        error: "Pharmacy name is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD"
      }, { status: 400 });
    }

    const stockValue = stock !== undefined ? parseInt(stock.toString()) : 0;
    if (isNaN(stockValue) || stockValue < 0) {
      return NextResponse.json({
        error: "Stock must be a non-negative integer",
        code: "INVALID_STOCK"
      }, { status: 400 });
    }

    // Insert inventory item
    const now = new Date().toISOString();
    const newItem = await db.insert(inventory)
      .values({
        medicineName: medicineName.trim(),
        pharmacyName: pharmacyName.trim(),
        stock: stockValue,
        lastUpdated: now,
      })
      .returning();

    return NextResponse.json(newItem[0], { status: 201 });
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
        error: "Inventory ID is required",
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
    let updateValues: any = { lastUpdated: new Date().toISOString() };

    if ('medicineName' in body) {
      if (typeof body.medicineName !== 'string' || !body.medicineName.trim()) {
        return NextResponse.json({
          error: "Medicine name must be a non-empty string",
          code: "INVALID_MEDICINE_NAME"
        }, { status: 400 });
      }
      updateValues.medicineName = body.medicineName.trim();
    }

    if ('pharmacyName' in body) {
      if (typeof body.pharmacyName !== 'string' || !body.pharmacyName.trim()) {
        return NextResponse.json({
          error: "Pharmacy name must be a non-empty string",
          code: "INVALID_PHARMACY_NAME"
        }, { status: 400 });
      }
      updateValues.pharmacyName = body.pharmacyName.trim();
    }

    if ('stock' in body) {
      const stockValue = parseInt(body.stock.toString());
      if (isNaN(stockValue) || stockValue < 0) {
        return NextResponse.json({
          error: "Stock must be a non-negative integer",
          code: "INVALID_STOCK"
        }, { status: 400 });
      }
      updateValues.stock = stockValue;
    }

    const updatedItem = await db
      .update(inventory)
      .set(updateValues)
      .where(eq(inventory.id, idNum))
      .returning();

    if (updatedItem.length === 0) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json(updatedItem[0]);
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
        error: "Inventory ID is required",
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

    const deletedItem = await db
      .delete(inventory)
      .where(eq(inventory.id, idNum))
      .returning();

    if (deletedItem.length === 0) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: "Inventory item successfully deleted",
      item: deletedItem[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}