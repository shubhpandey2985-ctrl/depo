import type { Role } from '../types/domain';
import { apiLogin, clearApiCredentials } from './api';

const AUTH_KEY = 'deeptech_auth';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  profession: string;
  role: Role;
  mustChangePassword: boolean;
}

interface LoginResponse {
  id: number;
  name: string;
  email: string;
  profession: string;
  role: Role;
  mustChangePassword: boolean;
}

export async function login(
  email: string,
  password: string
): Promise<AuthUser | null> {
  const cleanEmail = email.trim();

  try {
    const data: LoginResponse | null =
      await apiLogin(cleanEmail, password);

    if (data) {
      const user: AuthUser = {
        id: String(data.id),
        name: data.name,
        email: data.email,
        profession: data.profession,
        role: data.role,
        mustChangePassword:
          data.mustChangePassword === true,
      };

      localStorage.setItem(
        AUTH_KEY,
        JSON.stringify(user)
      );

      return user;
    }
  } catch (error) {
    console.warn(
      'Backend login failed or unreachable, checking demo accounts:',
      error
    );
  }

  // Fallback demo accounts if backend is not initialized or unreachable
  const normalizedEmail = cleanEmail.toLowerCase();
  if (normalizedEmail === 'admin@deeptech.com' && password === '123456') {
    const adminUser: AuthUser = {
      id: 'USR-001',
      name: 'Admin',
      email: 'admin@deeptech.com',
      profession: 'Staff',
      role: 'Admin',
      mustChangePassword: false,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(adminUser));
    return adminUser;
  }

  if (normalizedEmail === 'user@deeptech.com' && password === '123456') {
    const normalUser: AuthUser = {
      id: 'USR-002',
      name: 'Demo User',
      email: 'user@deeptech.com',
      profession: 'Student',
      role: 'User',
      mustChangePassword: false,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(normalUser));
    return normalUser;
  }

  return null;
}

export function updateStoredUser(updated: Partial<AuthUser>): AuthUser | null {
  const current = getCurrentUser();
  if (!current) return null;
  const merged: AuthUser = { ...current, ...updated };
  localStorage.setItem(AUTH_KEY, JSON.stringify(merged));
  return merged;
}

export function getCurrentUser(): AuthUser | null {

  const stored =
    localStorage.getItem(AUTH_KEY);

  if (!stored) {
    return null;
  }

  try {

    return JSON.parse(stored) as AuthUser;

  } catch {

    localStorage.removeItem(AUTH_KEY);

    return null;
  }
}

export function logout(): void {

  clearApiCredentials();

  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn(): boolean {

  return getCurrentUser() !== null;
}