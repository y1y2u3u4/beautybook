import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/inventory/products
 * Get products for a provider
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const providerId = searchParams.get('providerId');
    const category = searchParams.get('category');
    const lowStock = searchParams.get('lowStock') === 'true';

    if (!providerId) {
      return NextResponse.json(
        { error: 'Provider ID required' },
        { status: 400 }
      );
    }

    const where: any = { providerId, active: true };

    if (category) {
      where.category = category;
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Filter low stock if requested
    let filteredProducts = products;
    if (lowStock) {
      filteredProducts = products.filter(
        p => p.quantity <= p.lowStockThreshold
      );
    }

    return NextResponse.json({ products: filteredProducts });
  } catch (error: any) {
    console.error('[API] Failed to fetch products:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/products
 * Add a new product
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      providerId,
      name,
      description,
      sku,
      barcode,
      quantity,
      lowStockThreshold,
      unit,
      costPrice,
      sellPrice,
      category,
      brand,
      availableForSale,
    } = body;

    const product = await prisma.product.create({
      data: {
        providerId,
        name,
        description,
        sku,
        barcode,
        quantity: quantity || 0,
        lowStockThreshold: lowStockThreshold || 10,
        unit: unit || 'unit',
        costPrice,
        sellPrice,
        category,
        brand,
        availableForSale: availableForSale || false,
      },
    });

    // Create initial transaction if quantity > 0
    if (quantity > 0) {
      await prisma.inventoryTransaction.create({
        data: {
          productId: product.id,
          type: 'PURCHASE',
          quantity,
          unitCost: costPrice,
          totalCost: quantity * costPrice,
          referenceType: 'initial_stock',
          notes: 'Initial stock',
        },
      });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error('[API] Failed to create product:', error);

    return NextResponse.json(
      { error: error.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}
