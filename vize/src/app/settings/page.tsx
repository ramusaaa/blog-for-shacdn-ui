'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Shield, User, Bell } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [error] = useState('');
  const [success] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }

    // 2FA durumunu kontrol et
    const check2FAStatus = async () => {
      try {
        const response = await fetch('/api/2fa/status', {
          credentials: 'include'
        });
        const data = await response.json();
        if (response.ok) {
          setIs2FAEnabled(data.enabled);
        }
      } catch (err) {
        console.error('2FA durumu kontrol edilirken hata:', err);
      }
    };

    check2FAStatus();
  }, [status, router]);

  const handle2FASetup = () => {
    router.push('/settings/2fa');
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Hesap Ayarları</h1>

      <Tabs defaultValue="security" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Güvenlik
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Bildirimler
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Kişisel bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  defaultValue={session?.user?.name || ''}
                  placeholder="Ad Soyad"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={session?.user?.email || ''}
                  disabled
                />
              </div>
              <Button>Değişiklikleri Kaydet</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Güvenlik Ayarları</CardTitle>
              <CardDescription>
                Hesap güvenliğinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>İki Faktörlü Kimlik Doğrulama (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    Hesabınızı daha güvenli hale getirmek için İki Aşamalı Doğrulama'yı etkinleştirin.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Switch
                    checked={is2FAEnabled}
                    disabled
                    aria-label="2FA durumu"
                  />
                  <Button
                    variant={is2FAEnabled ? "outline" : "default"}
                    onClick={handle2FASetup}
                  >
                    {is2FAEnabled ? "2FA Ayarlarını Düzenle" : "2FA'yı Etkinleştir"}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-password">Mevcut Şifre</Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="Mevcut şifrenizi girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Şifre</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Yeni şifrenizi girin"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Yeni Şifre (Tekrar)</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Yeni şifrenizi tekrar girin"
                />
              </div>
              <Button>Şifreyi Değiştir</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Bildirim Ayarları</CardTitle>
              <CardDescription>
                Bildirim tercihlerinizi yönetin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>E-posta Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Yeni yorumlar ve etkileşimler hakkında e-posta alın
                  </p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Yorum Bildirimleri</Label>
                  <p className="text-sm text-muted-foreground">
                    Yazılarınıza yapılan yorumlar hakkında bildirim alın
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Hata</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mt-4">
          <AlertTitle>Başarılı</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
    </div>
  );
} 