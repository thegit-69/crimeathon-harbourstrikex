// Centralized API Client for HarbourStrikeX
// Connects to FastAPI Backend (Case CR-26-047)

import type {
  TicketRecord,
  VendorRecord,
  KeyRecord,
  DocRecord,
  InvoiceRecord,
  SyncJobRecord,
} from '../types';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8000';

// Token Management
export const getToken = (): string | null => {
  try {
    return localStorage.getItem('hsToken');
  } catch {
    return null;
  }
};

export const setToken = (token: string): void => {
  try {
    localStorage.setItem('hsToken', token);
  } catch {
    // ignore
  }
};

export const removeToken = (): void => {
  try {
    localStorage.removeItem('hsToken');
  } catch {
    // ignore
  }
};

// Generic Fetch Wrapper
interface RequestOptions extends RequestInit {
  apiKey?: string;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  // Dual-Auth: Attach API key if passed explicitly, or Bearer JWT token if available
  if (options.apiKey) {
    headers.set('X-Api-Key', options.apiKey);
  } else {
    const token = getToken();
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || JSON.stringify(errJson);
    } catch {
      // ignore
    }
    throw new Error(`API Error [${response.status}]: ${errorDetail}`);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

// Health Check
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return res.ok;
  } catch {
    return false;
  }
}

// -------------------------------------------------------------
// 1. Auth API
// -------------------------------------------------------------
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface UserProfile {
  username: string;
  full_name: string | null;
  role: string;
  status: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  refresh: async (): Promise<LoginResponse> => {
    return apiRequest<LoginResponse>('/auth/refresh', {
      method: 'POST',
    });
  },

  getMe: async (): Promise<UserProfile> => {
    return apiRequest<UserProfile>('/auth/me');
  },
};

// -------------------------------------------------------------
// 2. Dashboard API
// -------------------------------------------------------------
export interface DashboardStats {
  open_tickets: number;
  stored_documents: number;
  active_vendors: number;
  total_vendors: number;
  connected_integrations: number;
  integrations_attention: number;
}

export interface DashboardActivity {
  app: string;
  desc: string;
  actor?: string;
  ts?: string;
}

export interface SystemStatusItem {
  name: string;
  status: string;
  badge: 'ok' | 'warn' | 'risk';
}

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    return apiRequest<DashboardStats>('/api/dashboard/stats');
  },

  getActivity: async (): Promise<DashboardActivity[]> => {
    return apiRequest<DashboardActivity[]>('/api/dashboard/activity');
  },

  getStatus: async (): Promise<SystemStatusItem[]> => {
    return apiRequest<SystemStatusItem[]>('/api/dashboard/status');
  },
};

// -------------------------------------------------------------
// 3. LedgerOne Finance API
// -------------------------------------------------------------
export interface VendorDto {
  id: string;
  name: string;
  bank_account: string;
  status: string;
  approval: string;
}

export interface BankDetailChangeDto {
  id: string;
  vendor_id: string;
  actor: string | null;
  old_account: string | null;
  new_account: string | null;
  approval_ref: string | null;
  request_id: string | null;
}

export interface InvoiceDto {
  id: string;
  vendor: string;
  amount: string;
  due_date: string;
  status: string;
}

export interface ScheduledPaymentDto {
  id: string;
  vendor: string;
  amount: string;
  pay_date: string;
  status: string;
}

export const ledgeroneApi = {
  getVendors: async (): Promise<VendorDto[]> => {
    return apiRequest<VendorDto[]>('/api/v2/vendors');
  },

  createVendor: async (data: { id: string; name: string; bank_account?: string }): Promise<VendorDto> => {
    return apiRequest<VendorDto>('/api/v2/vendors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getVendor: async (vendorId: string): Promise<VendorDto> => {
    return apiRequest<VendorDto>(`/api/v2/vendors/${vendorId}`);
  },

  getBankDetails: async (vendorId: string): Promise<{ vendor_id: string; bank_account: string; request_id: string }> => {
    return apiRequest(`/api/v2/vendors/${vendorId}/bank-details`);
  },

  patchBankDetails: async (
    vendorId: string,
    data: {
      new_account: string;
      approval_ref?: string | null;
      actor?: string;
      caller_ip?: string;
      user_agent?: string;
    }
  ): Promise<{
    change_id: string;
    request_id: string;
    vendor_id: string;
    new_account: string;
    approval_ref: string | null;
    warning?: string | null;
  }> => {
    return apiRequest(`/api/v2/vendors/${vendorId}/bank-details`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  exportVendors: async (): Promise<{
    export_id: string;
    request_id: string;
    records: number;
    data: Array<{ id: string; name: string; bank_account: string }>;
  }> => {
    return apiRequest('/api/v2/vendors/export');
  },

  getChangeHistory: async (): Promise<BankDetailChangeDto[]> => {
    return apiRequest<BankDetailChangeDto[]>('/api/v2/vendors/change-history');
  },

  getInvoices: async (): Promise<InvoiceDto[]> => {
    return apiRequest<InvoiceDto[]>('/api/v2/invoices');
  },

  createInvoice: async (data: {
    id?: string;
    vendor: string;
    amount: string;
    due_date: string;
  }): Promise<InvoiceDto> => {
    return apiRequest<InvoiceDto>('/api/v2/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getScheduledPayments: async (): Promise<ScheduledPaymentDto[]> => {
    return apiRequest<ScheduledPaymentDto[]>('/api/v2/payments/scheduled');
  },

  schedulePayment: async (data: {
    vendor_id: string;
    vendor: string;
    amount: string;
    pay_date: string;
  }): Promise<ScheduledPaymentDto> => {
    return apiRequest<ScheduledPaymentDto>('/api/v2/payments/scheduled', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// -------------------------------------------------------------
// 4. HelpDeskr Support API
// -------------------------------------------------------------
export interface TicketDto {
  id: string;
  subject: string;
  requester: string | null;
  priority: string;
  status: string;
  assigned_to: string | null;
}

export interface ExportJobDto {
  id: string;
  actor: string | null;
  caller_ip: string | null;
  target: string | null;
  status: string;
}

export interface HelpDeskAuditLogDto {
  id: string;
  actor: string | null;
  event: string | null;
  object_ref: string | null;
  result: string;
}

export const helpdeskrApi = {
  getTickets: async (search?: string): Promise<TicketDto[]> => {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return apiRequest<TicketDto[]>(`/api/v1/support/tickets${q}`);
  },

  createTicket: async (data: {
    subject: string;
    requester: string;
    priority?: string;
    assigned_to?: string;
  }): Promise<TicketDto> => {
    return apiRequest<TicketDto>('/api/v1/support/tickets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateTicketStatus: async (ticketId: string, status: string): Promise<TicketDto> => {
    return apiRequest<TicketDto>(`/api/v1/support/tickets/${ticketId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteTicket: async (ticketId: string): Promise<void> => {
    return apiRequest<void>(`/api/v1/support/tickets/${ticketId}`, {
      method: 'DELETE',
    });
  },

  getExports: async (): Promise<ExportJobDto[]> => {
    return apiRequest<ExportJobDto[]>('/api/v1/support/exports');
  },

  createExport: async (data: {
    target?: string;
    actor?: string;
    caller_ip?: string;
  }): Promise<ExportJobDto> => {
    return apiRequest<ExportJobDto>('/api/v1/support/exports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteExport: async (exportId: string): Promise<void> => {
    return apiRequest<void>(`/api/v1/support/exports/${exportId}`, {
      method: 'DELETE',
    });
  },

  getAuditLog: async (limit = 50): Promise<HelpDeskAuditLogDto[]> => {
    return apiRequest<HelpDeskAuditLogDto[]>(`/api/v1/support/audit?limit=${limit}`);
  },
};

// -------------------------------------------------------------
// 5. BlueVault Storage API
// -------------------------------------------------------------
export interface DocumentDto {
  id: string;
  name: string | null;
  folder: string | null;
  file_type: string | null;
  access: string;
}

export interface StorageKeyDto {
  id: string;
  owner: string | null;
  scope: string | null;
  expiry: string;
  ip_restrict: string;
  status: string;
}

export interface StorageAccessLogDto {
  id: string;
  principal: string | null;
  path: string | null;
  source_ip: string | null;
  action: string | null;
}

export const bluevaultApi = {
  getDocuments: async (): Promise<DocumentDto[]> => {
    return apiRequest<DocumentDto[]>('/api/storage/documents');
  },

  createDocument: async (data: {
    name: string;
    folder?: string;
    file_type?: string;
    access?: string;
  }): Promise<DocumentDto> => {
    return apiRequest<DocumentDto>('/api/storage/documents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteDocument: async (docId: string): Promise<void> => {
    return apiRequest<void>(`/api/storage/documents/${encodeURIComponent(docId)}`, {
      method: 'DELETE',
    });
  },

  getKeys: async (): Promise<StorageKeyDto[]> => {
    return apiRequest<StorageKeyDto[]>('/api/storage/keys');
  },

  generateKey: async (data: {
    owner: string;
    scope?: string;
    expiry?: string;
    ip_restrict?: string;
  }): Promise<StorageKeyDto> => {
    return apiRequest<StorageKeyDto>('/api/storage/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  revokeKey: async (keyId: string): Promise<void> => {
    return apiRequest<void>(`/api/storage/keys/${keyId}`, {
      method: 'DELETE',
    });
  },

  getAccessLogs: async (limit = 50): Promise<StorageAccessLogDto[]> => {
    return apiRequest<StorageAccessLogDto[]>(`/api/storage/access-logs?limit=${limit}`);
  },

  listDirectory: async (path = '/'): Promise<{ path: string; folders: string[]; files: string[] }> => {
    return apiRequest(`/api/storage/list?path=${encodeURIComponent(path)}`);
  },

  readFile: async (path: string): Promise<{ path: string; actor: string; content: string; note: string }> => {
    return apiRequest(`/api/storage/read?path=${encodeURIComponent(path)}`);
  },
};

// -------------------------------------------------------------
// 6. TallyBridge Integration API
// -------------------------------------------------------------
export interface ApiKeyDto {
  id: string;
  owner: string | null;
  scope: string | null;
  expiry: string;
  ip_restrict: string;
  status: string;
}

export interface ServiceAccountDto {
  id: string;
  owner_team: string;
  purpose: string;
  last_used: string;
  status: string;
}

export interface ConnectedAppDto {
  app: string;
  env: string;
  account: string;
  permissions: string;
  status: string;
}

export interface PermissionReviewDto {
  principal: string;
  owner: string | null;
  scope: string | null;
  expiry: string;
  ip_restrict: string;
  status: string;
  risk: 'Over-privileged' | 'Review';
}

export interface SyncJobDto {
  id: string;
  name: string | null;
  target: string | null;
  last_run: string | null;
  status: string;
}

export interface NetworkFlowDto {
  id: string;
  src_ip: string | null;
  dst_ip: string | null;
  host_label: string | null;
  bytes_sent: string | null;
  endpoint: string | null;
  verdict: string;
}

export interface ApiActivityItem {
  system: string;
  actor?: string;
  method: string;
  endpoint: string;
  status: string;
  ts?: string;
}

export const tallybridgeApi = {
  getKeys: async (): Promise<ApiKeyDto[]> => {
    return apiRequest<ApiKeyDto[]>('/api/integration/keys');
  },

  createKey: async (data: {
    owner: string;
    scope?: string;
    expiry?: string;
    ip_restrict?: string;
  }): Promise<ApiKeyDto> => {
    return apiRequest<ApiKeyDto>('/api/integration/keys', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getServiceAccounts: async (): Promise<ServiceAccountDto[]> => {
    return apiRequest<ServiceAccountDto[]>('/api/integration/service-accounts');
  },

  getConnectedApps: async (): Promise<ConnectedAppDto[]> => {
    return apiRequest<ConnectedAppDto[]>('/api/integration/connected-apps');
  },

  getPermissions: async (): Promise<PermissionReviewDto[]> => {
    return apiRequest<PermissionReviewDto[]>('/api/integration/permissions');
  },

  getSyncJobs: async (): Promise<SyncJobDto[]> => {
    return apiRequest<SyncJobDto[]>('/api/integration/sync-jobs');
  },

  triggerSync: async (data: { name?: string; target?: string }): Promise<SyncJobDto> => {
    return apiRequest<SyncJobDto>('/api/integration/sync-jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getNetworkFlows: async (host?: string, limit = 50): Promise<NetworkFlowDto[]> => {
    const qHost = host ? `&host=${encodeURIComponent(host)}` : '';
    return apiRequest<NetworkFlowDto[]>(`/api/integration/network-flows?limit=${limit}${qHost}`);
  },

  getApiActivity: async (limit = 20): Promise<ApiActivityItem[]> => {
    return apiRequest<ApiActivityItem[]>(`/api/integration/api-activity?limit=${limit}`);
  },
};

// -------------------------------------------------------------
// Data Format Converters (DTO -> UI Tuple Records)
// -------------------------------------------------------------
export const converters = {
  vendorToRecord: (v: VendorDto): VendorRecord => [
    v.id,
    v.name,
    v.bank_account,
    v.status,
    v.approval,
  ],

  ticketToRecord: (t: TicketDto): TicketRecord => [
    t.id,
    t.subject,
    t.requester || '',
    t.priority,
    t.status,
    t.assigned_to || 'Support Queue',
  ],

  docToRecord: (d: DocumentDto): DocRecord => [
    d.name || '',
    d.folder || 'Finance',
    d.file_type || 'FILE',
    d.access,
  ],

  keyToRecord: (k: ApiKeyDto | StorageKeyDto): KeyRecord => [
    k.id,
    k.owner || '',
    k.scope || '',
    k.expiry,
    k.ip_restrict,
    k.status,
  ],

  invoiceToRecord: (i: InvoiceDto): InvoiceRecord => [
    i.id,
    i.vendor,
    i.amount,
    i.due_date,
    i.status,
  ],

  syncJobToRecord: (s: SyncJobDto): SyncJobRecord => [
    s.id,
    s.name || '',
    s.target || '',
    s.last_run || '',
    s.status,
  ],
};
