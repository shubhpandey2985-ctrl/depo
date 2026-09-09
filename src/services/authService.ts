import type { Role } from '../types';

const AUTH_KEY = 'deeptech_auth';

export interface AuthUser {
  name: string;
  email: string;
  role: Role;
}

const DEMO_USERS: AuthUser[] = [
  {
    name: 'Admin',
    email: 'admin@deeptech.com',
    role: 'Admin',
  },
  {
    name: 'Student User',
    email: 'user@deeptech.com',
    role: 'User',
  },
];

export function login(
  email: string,
  password: string
): AuthUser | null {
  // Demo authentication
  if (password !== '123456') {
    return null;
  }

  const user = DEMO_USERS.find(
    (item) => item.email.toLowerCase() === email.toLowerCase()
  );

  if (!user) {
    return null;
  }

  localStorage.setItem(AUTH_KEY, JSON.stringify(user));

  return user;
}

export function getCurrentUser(): AuthUser | null {
  const stored = localStorage.getItem(AUTH_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored);
  } catch {
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

export function logout() {
  localStorage.removeItem(AUTH_KEY);
}

export function isLoggedIn(): boolean {
  return getCurrentUser() !== null;
}