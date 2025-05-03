'use server';

import { prisma } from "@/lib/db";
import { sendNotificationEmail } from "@/lib/mail";
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const image = formData.get('image') as string;

  try {
    // Kullanıcı bilgilerini cookie'den al
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    let userId = '1'; // Varsayılan değer
    
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie.value);
        userId = userData.id;

        // Kullanıcının veritabanında var olup olmadığını kontrol et
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (!user) {
          // Kullanıcı yoksa oluştur
          const hashedPassword = await bcrypt.hash('defaultPassword123', 10);
          await prisma.user.create({
            data: {
              id: userId,
              name: userData.name,
              email: userData.email,
              role: userData.role || 'user',
              password: hashedPassword
            }
          });
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri ayrıştırılamadı:', error);
        return { success: false, error: 'Kullanıcı bilgileri geçersiz.' };
      }
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        image,
        authorId: userId,
      },
    });

    // E-posta bildirimi gönder
    await sendNotificationEmail(
      process.env.ADMIN_EMAIL || '',
      'Yeni Blog Yazısı Oluşturuldu',
      `"${title}" başlıklı yeni bir blog yazısı oluşturuldu.`
    );

    return { success: true, post };
  } catch (error) {
    console.error('Error creating post:', error);
    return { success: false, error: 'Blog yazısı oluşturulurken bir hata oluştu.' };
  }
} 