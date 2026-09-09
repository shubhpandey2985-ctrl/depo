import { getResources } from '../storage/localStorage';
import { getIssues } from '../storage/localStorage';
import { getUsers } from '../storage/localStorage';

export function getDashboardStats() {
  const resources = getResources();
  const issues = getIssues();
  const users = getUsers();

  const totalResources = resources.reduce(
    (total, resource) => total + resource.quantity,
    0
  );

  const issuedResources = issues.filter(
    (issue) => issue.status === 'Issued'
  ).length;

  const lowStock = resources.filter(
    (resource) => resource.status === 'Low stock'
  ).length;

  const overdue = issues.filter(
    (issue) => issue.status === 'Overdue'
  ).length;

  return {
    totalResources,
    issuedResources,
    lowStock,
    overdue,
    totalUsers: users.length,
  };
}