import { NextResponse } from 'next/server';

export async function POST() {
  // JWT token'ı geçersiz kılmak için bir işlem yapmaya gerek yok
  // Client tarafında token silinecek
  
  return NextResponse.json({ success: true });
} 