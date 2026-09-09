import type { Issue, Resource, User } from '../types';

export const seedResources: Resource[] = [
  {
    id: 'RES-001',
    name: 'Raspberry Pi 5',
    category: 'Hardware',
    sub: 'Development Board',
    quantity: 12,
    status: 'Available',
    tone: 'blue',
    location: 'Hardware Lab',
  },
  {
    id: 'RES-002',
    name: 'Arduino Uno',
    category: 'Hardware',
    sub: 'Development Board',
    quantity: 18,
    status: 'Available',
    tone: 'green',
    location: 'Hardware Lab',
  },
  {
    id: 'RES-003',
    name: 'VS Code Pro License',
    category: 'Software',
    sub: 'Development Software',
    quantity: 5,
    status: 'Low stock',
    tone: 'purple',
    location: 'Software Lab',
  },
  {
    id: 'RES-004',
    name: '3D Printer',
    category: 'Hardware',
    sub: 'Fabrication',
    quantity: 2,
    status: 'Available',
    tone: 'orange',
    location: 'Innovation Lab',
  },
  {
    id: 'RES-005',
    name: 'Toolkit Set',
    category: 'Hardware',
    sub: 'Tools',
    quantity: 8,
    status: 'Available',
    tone: 'yellow',
    location: 'Hardware Lab',
  },
  {
    id: 'RES-006',
    name: 'Lab Coat',
    category: 'Hardware',
    sub: 'Safety Equipment',
    quantity: 20,
    status: 'Available',
    tone: 'cyan',
    location: 'Store Room',
  },
];

export const seedUsers: User[] = [
  {
    id: 'USR-001',
    name: 'Admin',
    profession: 'Staff',
    role: 'Admin',
  },
];

export const seedIssues: Issue[] = [];