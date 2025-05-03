import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    // 2FA kontrolü
    if (user.twoFactorEnabled) {
      // 2FA kodu oluştur ve e-posta gönder
      const twoFactorCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Kodu veritabanına kaydet
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorCode, twoFactorCodeExpires: new Date(Date.now() + 10 * 60 * 1000) }, // 10 dakika geçerli
      });
      
      // E-posta gönder (gerçek uygulamada burada e-posta gönderimi yapılır)
      console.log(`2FA kodu: ${twoFactorCode}`);
      
      return NextResponse.json(
        { 
          message: 'İki faktörlü doğrulama gerekli',
          requiresTwoFactor: true
        },
        { status: 200 }
      );
    }

    // JWT token oluştur
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'gizli-anahtar',
      { expiresIn: '7d' }
    );

    // Kullanıcı bilgilerini döndür (şifre hariç)
    const { password: _, twoFactorCode, twoFactorCodeExpires, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
} 