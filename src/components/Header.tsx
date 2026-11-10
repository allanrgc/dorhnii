'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu,
  X,
  Phone,
  Sparkles,
  User,
  LayoutDashboard,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from './AuthModal';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register' | 'therapist'>('login');

  const isTherapist = pathname === '/terapeuta';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const openAuth = (tab: 'login' | 'register' | 'therapist') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
    setMobileOpen(false);
  };

  const switchRole = (therapist: boolean) => {
    if (therapist) {
      if (isAuthenticated && user?.role === 'therapist') {
        router.push('/terapeuta');
      } else {
        openAuth('therapist');
      }
    } else {
      router.push('/');
    }
    setMobileOpen(false);
  };

  const handleLogout = () => {
    logout();
    if (isTherapist) {
      router.push('/');
    }
    setMobileOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-xl shadow-[0_1px_0_0_rgba(231,229,228,0.5)]'
            : 'bg-canvas/60 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Brand */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 group"
            >
              <Sparkles className="h-5 w-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
              <span className="font-serif text-xl tracking-wide text-text-primary">
                Dohrnii
              </span>
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              {/* Role Switcher */}
              <div className="flex items-center bg-surface-warm rounded-full p-1 gap-0.5">
                <button
                  onClick={() => switchRole(false)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    !isTherapist
                      ? 'bg-white text-text-primary shadow-card'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <User className="h-3.5 w-3.5" />
                  Cliente
                </button>
                <button
                  onClick={() => switchRole(true)}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                    isTherapist
                      ? 'bg-white text-text-primary shadow-card'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  Terapeuta
                </button>
              </div>

              {/* Divider */}
              <div className="mx-3 h-5 w-px bg-border" />

              {/* Auth / User */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-sans text-text-secondary">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-error transition-colors duration-200"
                    title="Terminar sessão"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium text-[#4E5E50] bg-[#4E5E50]/10 hover:bg-[#4E5E50]/20 rounded-full transition-colors duration-200"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  Entrar
                </button>
              )}

              {/* Divider */}
              <div className="mx-2 h-5 w-px bg-border" />

              {/* WhatsApp Contact */}
              <a
                href="https://wa.me/351912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-text-secondary hover:text-primary transition-colors duration-200"
              >
                <Phone className="h-3.5 w-3.5" />
                <span className="hidden lg:inline">Contacto</span>
              </a>
            </nav>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden animate-slide-down border-t border-border bg-white/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-2">
              {/* Auth state */}
              {isAuthenticated ? (
                <div className="flex items-center justify-between px-4 py-3 bg-[#FBF9F5] rounded-xl mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#4E5E50] rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#1C1917]">{user?.name}</p>
                      <p className="text-xs text-[#78716C]">{user?.role === 'therapist' ? 'Terapeuta' : 'Cliente'}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-xs text-[#78716C] hover:text-[#9B4444] transition-colors flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sair
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => openAuth('login')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#4E5E50] text-white rounded-xl text-sm font-medium mb-2"
                >
                  <LogIn className="h-4 w-4" />
                  Entrar / Criar Conta
                </button>
              )}

              <button
                onClick={() => switchRole(false)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  !isTherapist
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-surface-warm'
                }`}
              >
                <User className="h-4 w-4" />
                Área do Cliente
              </button>
              <button
                onClick={() => switchRole(true)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isTherapist
                    ? 'bg-primary-50 text-primary'
                    : 'text-text-secondary hover:bg-surface-warm'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Painel do Terapeuta
              </button>

              <div className="divider my-3" />

              <a
                href="https://wa.me/351912345678"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-text-secondary hover:bg-surface-warm transition-all"
              >
                <Phone className="h-4 w-4" />
                Contactar via WhatsApp
              </a>
            </div>
          </div>
        )}
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialTab={authModalTab}
      />
    </>
  );
}
