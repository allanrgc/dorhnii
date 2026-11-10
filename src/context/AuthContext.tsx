'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { AuthUser, RegisteredUser, UserRole } from '../types';

// Simple hash for mock (NOT production — use bcrypt + backend)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

// Pre-configured accounts
const SEED_USERS: RegisteredUser[] = [
  {
    id: 'admin-1',
    name: 'Administrador Dohrnii',
    email: 'admin@dohrnii.pt',
    whatsapp: '+351 912 345 678',
    role: 'admin',
    passwordHash: simpleHash('admin2024'),
  },
  {
    id: 'therapist-1',
    name: 'Terapeuta Dohrnii',
    email: 'terapeuta@dohrnii.pt',
    whatsapp: '+351 912 345 678',
    role: 'therapist',
    passwordHash: simpleHash('tera2024'),
  },
];

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  registeredUsers: RegisteredUser[];
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (name: string, email: string, whatsapp: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  updateUserRole: (userId: string, role: UserRole) => void;
  deleteUser: (userId: string) => void;
  getAllUsers: () => RegisteredUser[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  currentUser: AuthUser | null;
  registeredUsers: RegisteredUser[];
}

const defaultAuthState: AuthState = {
  currentUser: null,
  registeredUsers: [...SEED_USERS],
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(defaultAuthState);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('dohrnii_registered_users');
      const savedCurrentUser = localStorage.getItem('dohrnii_current_user');

      let registeredUsers = defaultAuthState.registeredUsers;
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers) as RegisteredUser[];
        const seedEmails = SEED_USERS.map(u => u.email.toLowerCase());
        const nonSeedUsers = parsed.filter(u => !seedEmails.includes(u.email.toLowerCase()));
        registeredUsers = [...SEED_USERS, ...nonSeedUsers];
      }

      const currentUser = savedCurrentUser ? JSON.parse(savedCurrentUser) as AuthUser : null;
      setState({ registeredUsers, currentUser });
    } catch (e) {
      console.error('Failed to load auth state:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('dohrnii_registered_users', JSON.stringify(state.registeredUsers));
      if (state.currentUser) {
        localStorage.setItem('dohrnii_current_user', JSON.stringify(state.currentUser));
      } else {
        localStorage.removeItem('dohrnii_current_user');
      }
    }
  }, [state, isLoading]);

  const login = useCallback((email: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    const user = state.registeredUsers.find(u => u.email.toLowerCase() === normalizedEmail);

    if (!user) {
      return { success: false, error: 'Email não encontrado.' };
    }
    if (user.passwordHash !== simpleHash(password)) {
      return { success: false, error: 'Password incorreta.' };
    }

    const authUser: AuthUser = { id: user.id, name: user.name, email: user.email, whatsapp: user.whatsapp, role: user.role };
    setState(prev => ({ ...prev, currentUser: authUser }));
    return { success: true };
  }, [state.registeredUsers]);

  const register = useCallback((name: string, email: string, whatsapp: string, password: string): { success: boolean; error?: string } => {
    const normalizedEmail = email.toLowerCase().trim();
    if (!name.trim() || !normalizedEmail || !password) {
      return { success: false, error: 'Preencha todos os campos obrigatórios.' };
    }
    if (password.length < 4) {
      return { success: false, error: 'A password deve ter pelo menos 4 caracteres.' };
    }
    if (state.registeredUsers.some(u => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, error: 'Já existe uma conta com este email.' };
    }

    const newUser: RegisteredUser = {
      id: `client-${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      whatsapp: whatsapp.trim() || '',
      role: 'client',
      passwordHash: simpleHash(password),
    };
    const authUser: AuthUser = { id: newUser.id, name: newUser.name, email: newUser.email, whatsapp: newUser.whatsapp, role: 'client' };

    setState(prev => ({
      registeredUsers: [...prev.registeredUsers, newUser],
      currentUser: authUser,
    }));
    return { success: true };
  }, [state.registeredUsers]);

  const logout = useCallback(() => {
    setState(prev => ({ ...prev, currentUser: null }));
  }, []);

  const updateUserRole = useCallback((userId: string, role: UserRole) => {
    setState(prev => ({
      ...prev,
      registeredUsers: prev.registeredUsers.map(u => u.id === userId ? { ...u, role } : u),
    }));
  }, []);

  const deleteUser = useCallback((userId: string) => {
    if (SEED_USERS.some(u => u.id === userId)) return;
    setState(prev => ({
      ...prev,
      registeredUsers: prev.registeredUsers.filter(u => u.id !== userId),
    }));
  }, []);

  const getAllUsers = useCallback(() => state.registeredUsers, [state.registeredUsers]);

  return (
    <AuthContext.Provider
      value={{
        user: state.currentUser,
        isAuthenticated: !!state.currentUser,
        isLoading,
        registeredUsers: state.registeredUsers,
        login, register, logout,
        updateUserRole, deleteUser, getAllUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
