'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <footer className="bg-background border-t">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Hakkımızda */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hakkımızda</h3>
            <p className="text-muted-foreground">
              Blog sitemiz, teknoloji, yazılım ve dijital dünya hakkında güncel bilgiler sunan bir platformdur.
              Amacımız, okuyucularımıza kaliteli ve faydalı içerikler sunmaktır.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="ghost" size="icon" asChild>
                <Link href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Hızlı Bağlantılar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hızlı Bağlantılar</h3>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/blog" 
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  isActive('/blog') ? "text-primary" : "text-muted-foreground"
                )}
              >
                Blog
              </Link>
              <Link 
                href="/about" 
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  isActive('/about') ? "text-primary" : "text-muted-foreground"
                )}
              >
                Hakkımızda
              </Link>
              <Link 
                href="/contact" 
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  isActive('/contact') ? "text-primary" : "text-muted-foreground"
                )}
              >
                İletişim
              </Link>
              <Link 
                href="/privacy" 
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  isActive('/privacy') ? "text-primary" : "text-muted-foreground"
                )}
              >
                Gizlilik Politikası
              </Link>
              <Link 
                href="/terms" 
                className={cn(
                  "text-sm transition-colors hover:text-primary",
                  isActive('/terms') ? "text-primary" : "text-muted-foreground"
                )}
              >
                Kullanım Koşulları
              </Link>
            </nav>
          </div>

          {/* İletişim */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İletişim</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a href="mailto:info@blog.com" className="text-sm text-muted-foreground hover:text-primary">
                  info@blog.com
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <a href="tel:+901234567890" className="text-sm text-muted-foreground hover:text-primary">
                  +90 123 456 7890
                </a>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  İstanbul, Türkiye
                </span>
              </div>
            </div>
          </div>

          {/* Bülten */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Bültene Abone Ol</h3>
            <p className="text-sm text-muted-foreground">
              En son blog yazılarımız ve güncellemelerimizden haberdar olmak için bültenimize abone olun.
            </p>
            <form className="space-y-2">
              <Input type="email" placeholder="E-posta adresiniz" />
              <Button type="submit" className="w-full">Abone Ol</Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              &copy; {currentYear} Blog. Tüm hakları saklıdır.
            </p>
            <div className="flex items-center space-x-4">
              <Link 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Gizlilik Politikası
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Kullanım Koşulları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 