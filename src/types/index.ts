export type Role = 'Admin' | 'User';

export type Category = 'Hardware' | 'Software';

export type ResourceStatus =
  | 'Available'
  | 'Low stock'
  | 'Issued'
  | 'Unavailable';

export type Profession =
  | 'Student'
  | 'Teacher'
  | 'Staff'
  | 'Researcher'
  | 'Project Member'
  | 'Other';

export type IssueStatus = 'Issued' | 'Returned' | 'Overdue';

export interface Resource {
  id: string;
  name: string;
  category: Category;
  sub: string;
  quantity: number;
  status: ResourceStatus;
  tone: string;
  location?: string;
}

export interface User {
  id: string;
  name: string;
  profession: Profession;
  role: Role;
}

export interface Issue {
  id: string;
  resourceId: string;
  resourceName: string;

  userId: string;
  userName: string;

  profession: Profession;

  issuedAt: string;

  returnable: boolean;

  returnDate?: string;

  returnedAt?: string;

  status: IssueStatus;

  quantity: number;
}