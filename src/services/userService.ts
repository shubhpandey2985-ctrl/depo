import type { User } from '../types';
import { getUsers, saveUsers } from '../storage/localStorage';
import { seedUsers } from '../data/seedData';

export function initializeUsers(): User[] {
  const existing = getUsers();

  if (existing.length === 0) {
    saveUsers(seedUsers);
    return seedUsers;
  }

  return existing;
}

export function getAllUsers(): User[] {
  return getUsers();
}

export function addUser(user: User): User[] {
  const users = getUsers();
  const updated = [...users, user];

  saveUsers(updated);

  return updated;
}