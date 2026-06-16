import { NextResponse } from 'next/server';
import { getStoreConfig } from '@/lib/config';

export async function GET() {
  return NextResponse.json(getStoreConfig());
}
