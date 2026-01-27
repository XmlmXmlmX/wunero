import { NextRequest, NextResponse } from 'next/server';
import { extractProductInfo } from '@/lib/productParser';

// POST /api/parse-product - Extract product information from URL
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Extract product info server-side to avoid CORS issues
    const productInfo = await extractProductInfo(url);

    return NextResponse.json(productInfo);
  } catch (error) {
    console.error('Error parsing product URL:', error);
    return NextResponse.json(
      { error: 'Failed to parse product URL' }, 
      { status: 500 }
    );
  }
}
