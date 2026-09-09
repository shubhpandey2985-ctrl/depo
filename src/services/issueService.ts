import type { Issue, Resource, ResourceStatus } from '../types';
import {
  getIssues,
  saveIssues,
  getResources,
  saveResources,
} from '../storage/localStorage';

function isPastReturnDate(returnDate?: string) {
  if (!returnDate) return false;

  const parsed = new Date(returnDate);
  if (Number.isNaN(parsed.getTime())) return false;

  const endOfReturnDay = new Date(parsed);
  endOfReturnDay.setHours(23, 59, 59, 999);

  return endOfReturnDay.getTime() < Date.now();
}

export function getAllIssues(): Issue[] {
  return getIssues();
}

export function syncOverdueIssues(): Issue[] {
  const issues = getIssues();
  let changed = false;

  const updatedIssues = issues.map((issue) => {
    if (
      issue.status === 'Issued' &&
      issue.returnable &&
      isPastReturnDate(issue.returnDate)
    ) {
      changed = true;
      return { ...issue, status: 'Overdue' as const };
    }

    return issue;
  });

  if (changed) saveIssues(updatedIssues);

  return updatedIssues;
}

export function createIssue(issue: Issue): Issue[] {
  const issues = getIssues();
  const resources = getResources();
  const updatedIssues = [...issues, issue];

  const updatedResources: Resource[] = resources.map((resource): Resource => {
    if (resource.id !== issue.resourceId) return resource;

    const newQuantity = Math.max(0, resource.quantity - 1);
    const newStatus: ResourceStatus =
      newQuantity === 0
        ? 'Unavailable'
        : newQuantity <= 3
          ? 'Low stock'
          : 'Available';

    return { ...resource, quantity: newQuantity, status: newStatus };
  });

  saveIssues(updatedIssues);
  saveResources(updatedResources);

  return updatedIssues;
}

export function returnIssue(issueId: string): Issue[] {
  const issues = getIssues();
  const resources = getResources();
  const issue = issues.find((item) => item.id === issueId);

  if (!issue || issue.status === 'Returned') return issues;

  const updatedIssues = issues.map((item) =>
    item.id === issueId
      ? {
          ...item,
          status: 'Returned' as const,
          returnedAt: new Date().toISOString(),
        }
      : item
  );

  const updatedResources: Resource[] = resources.map((resource): Resource =>
    resource.id === issue.resourceId
      ? {
          ...resource,
          quantity: resource.quantity + 1,
          status: 'Available',
        }
      : resource
  );

  saveIssues(updatedIssues);
  saveResources(updatedResources);

  return updatedIssues;
}
