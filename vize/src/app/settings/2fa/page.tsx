'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';

export default function TwoFactorSettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    const fetchQRCode = async () => {
      try {
        const response = await fetch('/api/2fa/setup', {
          credentials: 'include'
        });
        const data = await response.json();

        if (response.ok) {
          setQrCode(data.qrCode);
          setSecret(data.secret);
        } else {
          setError(data.error || 'QR kodu alınırken bir hata oluştu');
        }
      } catch (err) {
        setError('QR kodu alınırken bir hata oluştu');
      }
    };

    fetchQRCode();
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/2fa/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setIs2FAEnabled(true);
        router.push('/settings');
      } else {
        setError(data.error || 'Doğrulama başarısız');
      }
    } catch (err) {
      setError('Doğrulama sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-background">
      <h1 className="text-3xl font-bold mb-8 text-foreground">İki Faktörlü Kimlik Doğrulama</h1>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded relative mb-6">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {is2FAEnabled ? (
        <div className="bg-green-100 dark:bg-green-900 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-100 px-4 py-3 rounded">
          İki faktörlü kimlik doğrulama başarıyla etkinleştirildi!
        </div>
      ) : (
        <div className="space-y-6">
          <div className="prose dark:prose-invert max-w-none">
            <h2>Kurulum Adımları</h2>
            <ol>
              <li>Google Authenticator veya benzeri bir 2FA uygulaması indirin</li>
              <li>Aşağıdaki QR kodu uygulamada tarayın</li>
              <li>Uygulamada görünen 6 haneli kodu girin</li>
            </ol>
          </div>

          {qrCode && (
            <div className="flex justify-center bg-white p-4 rounded-lg">
              <Image
                src={qrCode}
                alt="2FA QR Code"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token" className="block text-sm font-medium text-foreground mb-2">
                Doğrulama Kodu
              </label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-input placeholder:text-muted-foreground text-foreground"
                placeholder="6 haneli kodu girin"
                required
                pattern="[0-9]{6}"
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Doğrulanıyor...' : 'Doğrula ve Etkinleştir'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/settings')}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring transition-colors"
              >
                İptal
              </button>
            </div>
          </form>

          {secret && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                QR kodu tarayamıyorsanız, bu gizli anahtarı manuel olarak girebilirsiniz:
              </p>
              <code className="px-2 py-1 bg-background border rounded text-foreground">
                {secret}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 