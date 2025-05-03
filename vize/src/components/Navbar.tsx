'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/AuthProvider";
import { useState, useRef } from "react";
import { useNotifications } from "@/lib/notification-context";
import { Bell, Settings, User, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut: authSignOut, loading } = useAuth();
  const { addNotification } = useNotifications();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    try {
      await authSignOut();
      addNotification("Başarıyla çıkış yapıldı", "success");
    } catch (err) {
      console.error("Çıkış yapılırken bir hata oluştu:", err);
      addNotification("Çıkış yapılırken bir hata oluştu", "error");
    }
  };

  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Burada gerçek bir uygulamada dosyayı bir API'ye yükleyip URL'ini alırdınız
      // Şimdilik sadece local URL oluşturuyoruz
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      addNotification("Profil resmi başarıyla güncellendi", "success");
    } catch (err) {
      console.error("Profil resmi yüklenirken bir hata oluştu:", err);
      addNotification("Profil resmi yüklenirken bir hata oluştu", "error");
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleLogout = async () => {
    try {
      await signOut({ redirect: false });
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();
      const imageUrl = data.url;

      const userResponse = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (!userResponse.ok) {
        throw new Error("Profile update failed");
      }

      router.refresh();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Yükleme durumunda basit bir navbar göster
  if (loading) {
    return (
      <nav className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
                  Blog
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  if (status === "loading") {
    return (
      <nav className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <span className="text-2xl font-bold text-gray-900">Blog</span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href="/" className="text-2xl font-bold text-gray-900">
                Blog
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            {session ? (
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <Image
                      className="h-8 w-8 rounded-full"
                      src={session.user?.image || "/default-avatar.png"}
                      alt=""
                      width={32}
                      height={32}
                    />
                  </button>
                </div>

                {isMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="px-4 py-2">
                      <p className="text-sm text-gray-700">
                        {session.user?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {session.user?.email}
                      </p>
                    </div>
                    <div className="border-t border-gray-100">
                      <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileUpload}
                        />
                        Profil Fotoğrafı Değiştir
                      </label>
                    </div>
                    <div className="border-t border-gray-100">
                      <Link
                        href="/settings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Ayarlar
                      </Link>
                    </div>
                    <div className="border-t border-gray-100">
                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Giriş Yap
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 