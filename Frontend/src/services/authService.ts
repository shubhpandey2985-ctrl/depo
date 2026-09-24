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

  try {

    const data: LoginResponse | null =
      await apiLogin(email, password);

    if (!data) {
      return null;
    }

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

  } catch (error) {

    console.error(
      'Login request failed:',
      error
    );

    return null;
  }
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