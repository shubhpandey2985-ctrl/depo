import type { Issue } from '../types/domain';
import {
  getIssuesApi,
  getIssueApi,
  getIssuesByUserApi,
  getIssuesByResourceApi,
  getIssuesByStatusApi,
  createIssueApi,
  returnIssueApi,
  deleteIssueApi,
} from './api';

function mapIssue(data: any): Issue {
  return {
    id: String(data.id),
    resourceId: String(data.resourceId),
    resourceName: data.resourceName ?? '',
    userId: String(data.userId),
    userName: data.userName ?? '',
    profession: data.profession ?? '',
    issuedAt: data.issuedAt,
    returnable: data.returnable === true,
    returnDate: data.returnDate ?? undefined,
    returnedAt: data.returnedAt ?? undefined,
    status: data.status,
    quantity: data.quantity ?? 1,
  };
}

export async function getAllIssues(): Promise<Issue[]> {
  const data = await getIssuesApi();
  return data.map(mapIssue);
}

export async function getIssueById(
  issueId: string
): Promise<Issue> {
  const data = await getIssueApi(issueId);
  return mapIssue(data);
}

export async function getIssuesByUser(
  userId: string
): Promise<Issue[]> {
  const data = await getIssuesByUserApi(userId);
  return data.map(mapIssue);
}

export async function getIssuesByResource(
  resourceId: string
): Promise<Issue[]> {
  const data = await getIssuesByResourceApi(resourceId);
  return data.map(mapIssue);
}

export async function getIssuesByStatus(
  status: string
): Promise<Issue[]> {
  const data = await getIssuesByStatusApi(status);
  return data.map(mapIssue);
}

export async function createIssue(
  issue: Issue
): Promise<Issue> {

  const created = await createIssueApi(
    {
      issuedAt: issue.issuedAt,
      returnable: issue.returnable,
      returnDate: issue.returnDate,
      quantity: issue.quantity,
    },
    issue.userId,
    issue.resourceId
  );

  return mapIssue(created);
}

export async function returnIssue(
  issueId: string
): Promise<Issue> {

  const returned = await returnIssueApi(issueId);

  return mapIssue(returned);
}

export async function deleteIssue(
  issueId: string
): Promise<void> {

  await deleteIssueApi(issueId);
}

export async function syncOverdueIssues(): Promise<Issue[]> {
  /*
   * The backend automatically updates overdue issues
   * when dashboard/issue data is requested.
   *
   * We therefore fetch the latest issue data instead
   * of modifying localStorage.
   */
  const data = await getIssuesApi();

  return data.map(mapIssue);
}