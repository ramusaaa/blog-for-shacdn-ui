import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { message: 'Token bulunamadı' },
        { status: 401 }
      );
    }

    // Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli-anahtar') as {
      userId: string;
      email: string;
      role: string;
    };

    // Kullanıcıyı kontrol et
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password, twoFactorCode, twoFactorCodeExpires, ...userWithoutSensitive } = user;

    return NextResponse.json({
      user: userWithoutSensitive,
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { message: 'Token doğrulanamadı' },
      { status: 401 }
    );
  }
} 