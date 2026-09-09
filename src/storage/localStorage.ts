import type { Issue, Resource, User } from '../types';

const KEYS = {
  resources: 'deeptech_resources',
  users: 'deeptech_users',
  issues: 'deeptech_issues',
};

export function getResources(): Resource[] {
  return JSON.parse(localStorage.getItem(KEYS.resources) || '[]');
}

export function saveResources(resources: Resource[]) {
  localStorage.setItem(KEYS.resources, JSON.stringify(resources));
}

export function getUsers(): User[] {
  return JSON.parse(localStorage.getItem(KEYS.users) || '[]');
}

export function saveUsers(users: User[]) {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

export function getIssues(): Issue[] {
  return JSON.parse(localStorage.getItem(KEYS.issues) || '[]');
}

export function saveIssues(issues: Issue[]) {
  localStorage.setItem(KEYS.issues, JSON.stringify(issues));
}

export function clearStorage() {
  localStorage.removeItem(KEYS.resources);
  localStorage.removeItem(KEYS.users);
  localStorage.removeItem(KEYS.issues);
}