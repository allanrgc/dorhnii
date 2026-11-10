'use client';

import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
}

export default function AuthModal({ isOpen, onClose, initialTab = 'login' }: AuthModalProps) {
  const { login, register } = useAuth();

  const [tab, setTab] = useState<'login' | 'register'>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regWhatsapp, setRegWhatsapp] = useState('+351 ');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const resetForm = () => {
    setError('');
    setLoginEmail('');
    setLoginPassword('');
    setRegName('');
    setRegEmail('');
    setRegWhatsapp('+351 ');
    setRegPassword('');
    setRegConfirm('');
    setShowPassword(false);
  };

  const handleTabSwitch = (newTab: 'login' | 'register') => {
    setTab(newTab);
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    const result = login(loginEmail, loginPassword);
    if (result.success) {
      resetForm();
      onClose();
    } else {
      setError(result.error || 'Erro ao iniciar sessão.');
    }
    setIsSubmitting(false);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirm) {
      setError('As passwords não coincidem.');
      return;
    }
    setIsSubmitting(true);
    const result = register(regName, regEmail, regWhatsapp, regPassword);
    if (result.success) {
      resetForm();
      onClose();
    } else {
      setError(result.error || 'Erro ao criar conta.');
    }
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#1C1917]/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />

      <div className="relative bg-white rounded-sm shadow-elevated w-full max-w-md animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="relative bg-[#FBF9F5] px-6 py-5 border-b border-stone-200/80">
          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-[#78716C] hover:text-[#1C1917] transition-colors">
            <X className="w-5 h-5" />
          </button>
          <p className="font-serif text-2xl text-[#1C1917]">Dohrnii</p>
          <p className="text-sm text-[#78716C] font-sans mt-0.5">O seu espaço de bem-estar</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-stone-200/80">
          <button
            onClick={() => handleTabSwitch('login')}
            className={`flex-1 py-3 text-sm font-sans font-medium transition-colors relative ${tab === 'login' ? 'text-[#4E5E50]' : 'text-[#78716C] hover:text-[#1C1917]'}`}
          >
            Entrar
            {tab === 'login' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4E5E50]" />}
          </button>
          <button
            onClick={() => handleTabSwitch('register')}
            className={`flex-1 py-3 text-sm font-sans font-medium transition-colors relative ${tab === 'register' ? 'text-[#4E5E50]' : 'text-[#78716C] hover:text-[#1C1917]'}`}
          >
            Criar Conta
            {tab === 'register' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#4E5E50]" />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-[#FDE8E8] border border-[#9B4444]/20 rounded-sm text-sm text-[#9B4444] font-sans animate-slide-down">
            {error}
          </div>
        )}

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="p-6 space-y-4 animate-fade-in">
            <div>
              <label className="block text-sm text-[#78716C] font-sans mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8B7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="email@exemplo.pt" required
                  className="w-full p-3 pl-10 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#78716C] font-sans mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8B7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type={showPassword ? 'text' : 'password'} value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="A sua password" required
                  className="w-full p-3 pl-10 pr-10 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B7E6A] hover:text-[#1C1917] transition-colors">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting || !loginEmail || !loginPassword}
              className="w-full bg-[#4E5E50] hover:bg-[#586B5A] text-[#FBF9F5] py-3 rounded-sm text-sm font-sans uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed btn-press">
              Entrar
            </button>
            <p className="text-center text-xs text-[#78716C] font-sans">
              Não tem conta?{' '}
              <button type="button" onClick={() => handleTabSwitch('register')} className="text-[#4E5E50] underline underline-offset-2">Criar conta</button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="p-6 space-y-3 animate-fade-in">
            <div>
              <label className="block text-sm text-[#78716C] font-sans mb-1.5">Nome completo</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8B7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)}
                  placeholder="O seu nome" required
                  className="w-full p-3 pl-10 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#78716C] font-sans mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8B7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="email@exemplo.pt" required
                  className="w-full p-3 pl-10 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all" />
              </div>
            </div>
            <div>
              <label className="block text-sm text-[#78716C] font-sans mb-1.5">WhatsApp</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8B7E6A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input type="tel" value={regWhatsapp} onChange={(e) => setRegWhatsapp(e.target.value)}
                  placeholder="+351 912 345 678"
                  className="w-full p-3 pl-10 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-[#78716C] font-sans mb-1.5">Password</label>
                <input type={showPassword ? 'text' : 'password'} value={regPassword} onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Min. 4 caracteres" required minLength={4}
                  className="w-full p-3 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all" />
              </div>
              <div>
                <label className="block text-sm text-[#78716C] font-sans mb-1.5">Confirmar</label>
                <input type={showPassword ? 'text' : 'password'} value={regConfirm} onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Repetir password" required
                  className="w-full p-3 border border-stone-200/80 rounded-sm bg-white focus:outline-none focus:border-[#4E5E50] focus:ring-1 focus:ring-[#4E5E50]/20 font-sans text-sm transition-all" />
              </div>
            </div>
            <div className="pt-1">
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-[#78716C] font-sans flex items-center gap-1 hover:text-[#1C1917] transition-colors">
                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showPassword ? 'Ocultar passwords' : 'Mostrar passwords'}
              </button>
            </div>
            <button type="submit" disabled={isSubmitting || !regName || !regEmail || !regPassword || !regConfirm}
              className="w-full bg-[#4E5E50] hover:bg-[#586B5A] text-[#FBF9F5] py-3 rounded-sm text-sm font-sans uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed btn-press">
              Criar Conta
            </button>
            <p className="text-center text-xs text-[#78716C] font-sans">
              Já tem conta?{' '}
              <button type="button" onClick={() => handleTabSwitch('login')} className="text-[#4E5E50] underline underline-offset-2">Entrar</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
