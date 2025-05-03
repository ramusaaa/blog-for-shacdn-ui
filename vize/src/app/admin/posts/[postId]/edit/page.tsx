'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { use } from 'react';

interface PostParams {
  postId: string;
}

export default function EditPostPage({ params }: { params: PostParams }) {
  const router = useRouter();
  const { status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolvedParams = use(params) as PostParams;

  useEffect(() => {
    // Oturum kontrolü
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/posts/${resolvedParams.postId}`);
        if (!response.ok) {
          throw new Error('Blog yazısı bulunamadı');
        }
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setImage(data.image || '');
      } catch (err) {
        setError('Blog yazısı yüklenirken bir hata oluştu');
        console.error(err);
      }
    };

    fetchPost();
  }, [resolvedParams.postId, status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/posts/${resolvedParams.postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          content,
          image,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Blog yazısı güncellenirken bir hata oluştu');
      }

      router.push('/admin');
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'Blog yazısı güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Dosya yüklenirken bir hata oluştu');
      }

      const data = await response.json();
      setImage(data.url);
    } catch (err: Error | unknown) {
      setUploadError(err instanceof Error ? err.message : 'Dosya yüklenirken bir hata oluştu');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const isValidImageUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-background">
      <h1 className="text-3xl font-bold mb-8 text-foreground">Blog Yazısını Düzenle</h1>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded relative mb-6" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Başlık
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input placeholder:text-muted-foreground text-foreground"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="text-sm font-medium text-foreground">
            İçerik
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={10}
            className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input placeholder:text-muted-foreground text-foreground"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Görsel
          </label>
          
          {image && isValidImageUrl(image) && (
            <div className="mb-4 relative w-full h-64 rounded-lg overflow-hidden border border-input">
              <Image
                src={image}
                alt="Blog görseli"
                fill
                className="object-cover"
              />
            </div>
          )}
          
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="flex-1 px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input placeholder:text-muted-foreground text-foreground"
              placeholder="Görsel URL'si veya yüklemek için butona tıklayın"
            />
            <button
              type="button"
              onClick={handleUploadClick}
              disabled={isUploading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-colors"
            >
              {isUploading ? 'Yükleniyor...' : 'Görsel Yükle'}
            </button>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {uploadError && (
            <p className="mt-2 text-sm text-destructive">{uploadError}</p>
          )}
        </div>

        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin')}
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
} 