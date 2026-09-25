const API_BASE_URL = 'http://localhost:8080/api';

const AUTH_USER_KEY = 'deeptech_auth';

interface StoredAuthUser {
  id: string;
  name: string;
  email: string;
  profession: string;
  role: 'Admin' | 'User';
}

function getStoredUser(): StoredAuthUser | null {
  const stored = localStorage.getItem(AUTH_USER_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as StoredAuthUser;
  } catch {
    return null;
  }
}

/*
 * Spring Security is currently using HTTP Basic Authentication.
 *
 * For this demo integration we temporarily keep the email/password
 * in sessionStorage so protected API requests can authenticate.
 *
 * We will replace this with a proper token/session approach later.
 */

export function saveApiCredentials(
  email: string,
  password: string
): void {
  const credentials = btoa(`${email}:${password}`);

  sessionStorage.setItem(
    'deeptech_api_credentials',
    credentials
  );
}

export function clearApiCredentials(): void {
  sessionStorage.removeItem(
    'deeptech_api_credentials'
  );
}

export function getApiCredentials(): string | null {
  return sessionStorage.getItem(
    'deeptech_api_credentials'
  );
}

export function getStoredPassword(): string {
  try {
    const creds = sessionStorage.getItem('deeptech_api_credentials');
    if (!creds) return '';
    const decoded = atob(creds);
    const colonIndex = decoded.indexOf(':');
    return colonIndex !== -1 ? decoded.slice(colonIndex + 1) : '';
  } catch {
    return '';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const headers = new Headers(
    options.headers
  );

  headers.set(
    'Content-Type',
    'application/json'
  );

  const credentials =
    getApiCredentials();

  if (credentials) {
    headers.set(
      'Authorization',
      `Basic ${credentials}`
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {

    let message =
      `Request failed with status ${response.status}`;

    try {
      const errorData =
        await response.json();

      if (errorData?.error) {
        message = errorData.error;
      }
    } catch {
      // Ignore invalid/non-JSON error responses.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

/* =========================
   AUTH
========================= */

export async function apiLogin(
  email: string,
  password: string
) {

  const response = await fetch(
    `${API_BASE_URL}/auth/login`,
    {
      method: 'POST',

      headers: {
        'Content-Type': 'application/json',
      },

      body: JSON.stringify({
        email,
        password,
      }),
    }
  );

  if (!response.ok) {
    return null;
  }

  const user = await response.json();

  saveApiCredentials(
    email,
    password
  );

  return user;
}

/* =========================
   USERS
========================= */
/* USERS */

export async function getUsersApi() {
  return request<any[]>('/users');
}

export async function getUserApi(id: string) {
  return request<any>(`/users/${id}`);
}

export async function createUserApi(user: any) {
  return request<any>('/users', {
    method: 'POST',
    body: JSON.stringify(user),
  });
}

export async function updateUserApi(
  id: string,
  user: any
) {
  return request<any>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(user),
  });
}

export async function deleteUserApi(id: string) {
  return request<void>(`/users/${id}`, {
    method: 'DELETE',
  });
}

/* =========================
   RESOURCES
========================= */

export async function getResourcesApi() {
  return request<any[]>(
    '/resources'
  );
}

export async function getResourceApi(
  id: string
) {
  return request<any>(
    `/resources/${id}`
  );
}

export async function createResourceApi(
  resource: any
) {
  return request<any>(
    '/resources',
    {
      method: 'POST',
      body: JSON.stringify(resource),
    }
  );
}

export async function updateResourceApi(
  id: string,
  resource: any
) {
  return request<any>(
    `/resources/${id}`,
    {
      method: 'PUT',
      body: JSON.stringify(resource),
    }
  );
}

export async function deleteResourceApi(
  id: string
) {
  return request<void>(
    `/resources/${id}`,
    {
      method: 'DELETE',
    }
  );
}

/* ISSUES */

export async function getIssuesApi() {
  return request<any[]>('/issues');
}

export async function getIssueApi(id: string) {
  return request<any>(`/issues/${id}`);
}

export async function getIssuesByUserApi(userId: string) {
  return request<any[]>(
    `/issues/user/${encodeURIComponent(userId)}`
  );
}

export async function getIssuesByResourceApi(resourceId: string) {
  return request<any[]>(
    `/issues/resource/${encodeURIComponent(resourceId)}`
  );
}

export async function getIssuesByStatusApi(status: string) {
  return request<any[]>(
    `/issues/status/${encodeURIComponent(status)}`
  );
}

export async function createIssueApi(
  issue: any,
  userId: string,
  resourceId: string
) {
  return request<any>(
    `/issues?userId=${encodeURIComponent(userId)}&resourceId=${encodeURIComponent(resourceId)}`,
    {
      method: 'POST',
      body: JSON.stringify(issue),
    }
  );
}

export async function returnIssueApi(id: string) {
  return request<any>(
    `/issues/${encodeURIComponent(id)}/return`,
    {
      method: 'PUT',
    }
  );
}

export async function deleteIssueApi(id: string) {
  return request<void>(
    `/issues/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
    }
  );
}
/* =========================
   DASHBOARD
========================= */

export async function getDashboardApi() {
  return request<any>(
    '/dashboard'
  );
}

/* =========================
   AUDIT LOGS
========================= */

export async function getAuditLogsApi() {
  return request<any[]>(
    '/audit-logs'
  );
}

/* =========================
   LOGOUT
========================= */

export function apiLogout(): void {
  clearApiCredentials();
  localStorage.removeItem(
    AUTH_USER_KEY
  );
}

/* =========================
   CURRENT USER
========================= */

export function getCurrentApiUser() {
  return getStoredUser();
}