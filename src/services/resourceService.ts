import type { Resource } from '../types';
import { getResources, saveResources } from '../storage/localStorage';
import { seedResources } from '../data/seedData';

export function initializeResources(): Resource[] {
  const existing = getResources();

  if (existing.length === 0) {
    saveResources(seedResources);
    return seedResources;
  }

  return existing;
}

export function getAllResources(): Resource[] {
  return getResources();
}

export function addResource(resource: Resource): Resource[] {
  const resources = getResources();
  const updated = [...resources, resource];

  saveResources(updated);

  return updated;
}

export function updateResource(
  resourceId: string,
  updates: Partial<Resource>
): Resource[] {
  const resources = getResources();

  const updated = resources.map((resource) =>
    resource.id === resourceId
      ? { ...resource, ...updates }
      : resource
  );

  saveResources(updated);

  return updated;
}