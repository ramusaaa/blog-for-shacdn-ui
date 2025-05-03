import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password, token } = await request.json();

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz kullanıcı' },
        { status: 401 }
      );
    }

    // 2FA kodunu kontrol et
    if (!user.twoFactorCode || !user.twoFactorCodeExpires) {
      return NextResponse.json(
        { message: 'Doğrulama kodu bulunamadı' },
        { status: 400 }
      );
    }

    // Kodun süresi dolmuş mu kontrol et
    if (new Date() > user.twoFactorCodeExpires) {
      return NextResponse.json(
        { message: 'Doğrulama kodunun süresi dolmuş' },
        { status: 400 }
      );
    }

    // Kodu kontrol et
    if (user.twoFactorCode !== token) {
      return NextResponse.json(
        { message: 'Geçersiz doğrulama kodu' },
        { status: 401 }
      );
    }

    // Kodu temizle
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        twoFactorCode: null,
        twoFactorCodeExpires: null
      },
    });

    // JWT token oluştur
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'gizli-anahtar',
      { expiresIn: '7d' }
    );

    // Kullanıcı bilgilerini döndür (şifre ve 2FA bilgileri hariç)
    const { password: _, twoFactorCode, twoFactorCodeExpires, ...userWithoutSensitive } = user;

    return NextResponse.json({
      user: userWithoutSensitive,
      token: jwtToken,
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json(
      { message: 'Doğrulama sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
} 