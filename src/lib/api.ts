const API_BASE = import.meta.env.VITE_API_URL || 'https://contactformapi.contactformapi.workers.dev';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const userId = localStorage.getItem('user_id');
  if (userId) headers['X-User-Id'] = userId;
  const workspaceId = localStorage.getItem('workspace_id');
  if (workspaceId) headers['X-Workspace-Id'] = workspaceId;
  return headers;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    ...getHeaders(),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// --- Types ---

export interface Workspace {
  teamId: string;
  teamName: string;
  role: string;
  ownerId: string;
  plan?: string;
}

export interface WorkspaceMember {
  memberId: string;
  userId: string;
  role: string;
  joinedAt: string | null;
  userName: string;
  userEmail: string;
  userImage: string | null;
}

export interface WorkspaceInvite {
  id: string;
  teamId: string;
  email: string;
  role: string;
  invitedBy: string;
  createdAt: string | null;
}

export interface Form {
  id: string;
  name: string;
  teamId: string | null;
  userId: string;
  redirectUrl: string | null;
  emailNotifications: number;
  submissionCount: number;
  createdAt: string | null;
  canWrite?: boolean;
}

export interface Submission {
  id: number;
  submissionNumber: number | null;
  data: Record<string, unknown>;
  isSpam: number;
  createdAt: string | null;
}

export interface SubmissionsResponse {
  items: Submission[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlanConfig {
  id: string;
  name: string;
  forms_limit: number;
  forms_limit_display: string | number;
  submissions_limit: number;
  webhooks: boolean;
  custom_redirects: boolean;
  recaptcha: boolean;
  origin_whitelist: boolean;
  email_notifications: boolean;
  webhook_logs: boolean;
  api_access: boolean;
}

export interface SubscriptionData {
  id: string;
  plan: string;
  status: string;
  stripePriceId: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: number;
}

export type WorkspaceRole = 'owner' | 'admin' | 'editor' | 'viewer';

export const ROLE_PERMISSIONS: Record<WorkspaceRole, {
  manageForms: boolean;
  readSubmissions: boolean;
  changeSettings: boolean;
  inviteMembers: boolean;
  manageBilling: boolean;
  deleteWorkspace: boolean;
}> = {
  owner: { manageForms: true, readSubmissions: true, changeSettings: true, inviteMembers: true, manageBilling: true, deleteWorkspace: true },
  admin: { manageForms: true, readSubmissions: true, changeSettings: true, inviteMembers: true, manageBilling: false, deleteWorkspace: false },
  editor: { manageForms: true, readSubmissions: true, changeSettings: false, inviteMembers: false, manageBilling: false, deleteWorkspace: false },
  viewer: { manageForms: false, readSubmissions: true, changeSettings: false, inviteMembers: false, manageBilling: false, deleteWorkspace: false },
};

// --- API ---

export const api = {
  // Workspaces
  workspaces: {
    list: () => request<Workspace[]>('/api/teams'),

    create: (name: string) =>
      request<{ id: string; name: string; role: string }>('/api/teams', {
        method: 'POST',
        body: JSON.stringify({ name }),
      }),
  },

  // Members
  members: {
    list: (workspaceId: string) =>
      request<WorkspaceMember[]>(`/api/teams/${workspaceId}/members`),

    remove: (workspaceId: string, userId: string) =>
      request<{ success: boolean }>(`/api/teams/${workspaceId}/members`, {
        method: 'DELETE',
        body: JSON.stringify({ userId }),
      }),
  },

  // Invites
  invites: {
    list: (workspaceId: string) =>
      request<WorkspaceInvite[]>(`/api/teams/${workspaceId}/invite`),

    send: (workspaceId: string, email: string, role: string) =>
      request<{ success: boolean; message: string; inviteId?: string; directAdd?: boolean }>(
        `/api/teams/${workspaceId}/invite`,
        { method: 'POST', body: JSON.stringify({ email, role }) },
      ),

    revoke: (workspaceId: string, inviteId: string) =>
      request<{ success: boolean }>(`/api/teams/${workspaceId}/invite`, {
        method: 'DELETE',
        body: JSON.stringify({ inviteId }),
      }),
  },

  // Forms
  forms: {
    list: (account: string = 'personal') =>
      request<Form[]>(`/api/forms?account=${encodeURIComponent(account)}`),

    get: (id: string) =>
      request<Form & { canWrite: boolean }>(`/api/forms/${id}`),

    create: (data: { name: string; teamId?: string | null; redirectUrl?: string | null; emailNotifications?: boolean }) =>
      request<{ id: string; name: string; teamId: string | null }>('/api/forms', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: Partial<{ name: string; redirectUrl: string | null; emailNotifications: boolean }>) =>
      request<{ success: boolean }>(`/api/forms/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/api/forms/${id}`, { method: 'DELETE' }),
  },

  // Submissions
  submissions: {
    list: (formId: string, page = 1, limit = 25) =>
      request<SubmissionsResponse>(
        `/api/forms/${formId}/submissions?page=${page}&limit=${limit}`,
      ),
  },

  // Stripe Billing
  billing: {
    checkout: (plan: string, interval: 'month' | 'year' = 'month') =>
      request<{ url: string }>('/api/stripe/checkout', {
        method: 'POST',
        body: JSON.stringify({ plan, interval }),
      }),

    portal: () =>
      request<{ url: string }>('/api/stripe/portal', { method: 'POST' }),
  },
};

export { API_BASE };
