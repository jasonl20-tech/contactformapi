const API_BASE = import.meta.env.VITE_API_URL || 'https://contactformapi.contactformapi.workers.dev';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('user_id');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['X-User-Id'] = token;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export interface Form {
  id: string;
  user_id: string;
  name: string;
  email_to: string | null;
  email_subject: string | null;
  email_from_name: string | null;
  redirect_url: string | null;
  error_redirect_url: string | null;
  append_params: number;
  honeypot_enabled: number;
  recaptcha_enabled: number;
  recaptcha_secret: string | null;
  allowed_origins: string | null;
  webhook_url: string | null;
  webhook_secret: string | null;
  is_active: number;
  submission_count: number;
  created_at: string;
  updated_at: string;
}

export interface Submission {
  id: string;
  form_id: string;
  data: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  origin: string;
  is_spam: number;
  is_read: number;
  created_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export const api = {
  forms: {
    list: (page = 1, limit = 20) =>
      request<{ data: Form[]; pagination: Pagination }>(`/api/forms?page=${page}&limit=${limit}`),

    get: (id: string) =>
      request<{ data: Form }>(`/api/forms/${id}`),

    create: (data: Partial<Form>) =>
      request<{ data: Form }>('/api/forms', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: string, data: Partial<Form>) =>
      request<{ data: Form }>(`/api/forms/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

    delete: (id: string) =>
      request<{ success: boolean }>(`/api/forms/${id}`, { method: 'DELETE' }),
  },

  submissions: {
    list: (formId: string, page = 1, limit = 20) =>
      request<{ data: Submission[]; pagination: Pagination }>(
        `/api/forms/${formId}/submissions?page=${page}&limit=${limit}`
      ),

    get: (formId: string, id: string) =>
      request<{ data: Submission }>(`/api/forms/${formId}/submissions/${id}`),

    delete: (formId: string, id: string) =>
      request<{ success: boolean }>(`/api/forms/${formId}/submissions/${id}`, { method: 'DELETE' }),
  },
};
