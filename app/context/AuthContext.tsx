'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, name: string, password: string, role: 'admin' | 'guru' | 'user') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_ADMIN: User = {
  id: 'ADM001',
  name: 'Administrator',
  username: 'admin',
  password: 'admin',
  role: 'admin',
  approved: true,
};

const DEFAULT_GURU: User = {
  id: 'GRU001',
  name: 'Budi Santoso',
  username: 'guru',
  password: 'guru',
  role: 'guru',
  approved: true,
};

const DEFAULT_USER: User = {
  id: 'USR001',
  name: 'Ahmad Mahasiswa',
  username: 'user',
  password: 'user',
  role: 'user',
  approved: true,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Seed default users if they don't exist
    const storedUsers = localStorage.getItem('qr_users');
    if (!storedUsers) {
      localStorage.setItem('qr_users', JSON.stringify([DEFAULT_ADMIN, DEFAULT_GURU, DEFAULT_USER]));
    }

    // Load active session user
    const activeUser = localStorage.getItem('qr_current_user');

    // Defer state updates to avoid synchronous cascading renders warning
    setTimeout(() => {
      if (activeUser) {
        try {
          setUser(JSON.parse(activeUser));
        } catch {
          localStorage.removeItem('qr_current_user');
        }
      }
      setLoading(false);
    }, 0);
  }, []);

  const login = async (username: string, password: string) => {
    const storedUsers = localStorage.getItem('qr_users');
    const usersList: User[] = storedUsers ? JSON.parse(storedUsers) : [DEFAULT_ADMIN, DEFAULT_GURU, DEFAULT_USER];

    const foundUser = usersList.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === password
    );

    if (foundUser) {
      if (foundUser.approved === false) {
        return { success: false, error: 'Akun Anda belum disetujui oleh admin. Harap hubungi administrator.' };
      }
      // Exclude password from current session state
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      localStorage.setItem('qr_current_user', JSON.stringify(userWithoutPassword));
      setUser(userWithoutPassword);
      return { success: true };
    } else {
      return { success: false, error: 'Username atau password salah.' };
    }
  };

  const register = async (username: string, name: string, password: string, role: 'admin' | 'guru' | 'user') => {
    const storedUsers = localStorage.getItem('qr_users');
    const usersList: User[] = storedUsers ? JSON.parse(storedUsers) : [DEFAULT_ADMIN, DEFAULT_GURU, DEFAULT_USER];

    const isDuplicate = usersList.some((u) => u.username.toLowerCase() === username.toLowerCase());
    if (isDuplicate) {
      return { success: false, error: 'Username sudah digunakan.' };
    }

    // Generate user ID based on role
    const prefix = role === 'admin' ? 'ADM' : role === 'guru' ? 'GRU' : 'USR';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newId = `${prefix}${randNum}`;

    const newUser: User = {
      id: newId,
      name,
      username,
      password,
      role,
      approved: false, // Newly registered users require admin approval
    };

    const updatedUsers = [...usersList, newUser];
    localStorage.setItem('qr_users', JSON.stringify(updatedUsers));

    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('qr_current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
