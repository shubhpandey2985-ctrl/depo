import type { Issue, Resource, ResourceStatus } from '../types';
import {
  getIssues,
  saveIssues,
  getResources,
  saveResources,
} from '../storage/localStorage';

export function getAllIssues(): Issue[] {
  return getIssues();
}

export function createIssue(issue: Issue): Issue[] {
  const issues = getIssues();
  const resources = getResources();

  const updatedIssues = [...issues, issue];

  const updatedResources: Resource[] = resources.map(
    (resource): Resource => {
      if (resource.id !== issue.resourceId) {
        return resource;
      }

      const newQuantity = Math.max(0, resource.quantity - 1);

      const newStatus: ResourceStatus =
        newQuantity === 0
          ? 'Unavailable'
          : newQuantity <= 3
            ? 'Low stock'
            : 'Available';

      return {
        ...resource,
        quantity: newQuantity,
        status: newStatus,
      };
    }
  );

  saveIssues(updatedIssues);
  saveResources(updatedResources);

  return updatedIssues;
}

export function returnIssue(issueId: string): Issue[] {
  const issues = getIssues();
  const resources = getResources();

  const issue = issues.find((item) => item.id === issueId);

  if (!issue || issue.status === 'Returned') {
    return issues;
  }

  const updatedIssues = issues.map((item) =>
    item.id === issueId
      ? {
          ...item,
          status: 'Returned' as const,
          returnedAt: new Date().toISOString(),
        }
      : item
  );

  const updatedResources: Resource[] = resources.map(
    (resource): Resource =>
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