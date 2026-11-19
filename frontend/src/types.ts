export type AppTheme = 'overview' | 'help' | 'blue' | 'ledger' | 'tally' | 'evidence';

export type PageId = 'dashboard' | 'help' | 'blue' | 'ledger' | 'tally' | 'evidence';

export interface AppDefinition {
  id: PageId;
  name: string;
  desc: string;
  icon: string;
  tabs: string[];
}

export type TicketRecord = [string, string, string, string, string, string]; // [id, subject, requester, priority, status, assignedTo]
export type VendorRecord = [string, string, string, string, string]; // [id, name, bank, status, approval]
export type KeyRecord = [string, string, string, string, string, string]; // [keyId, owner, scope, expiry, ip, status]
export type DocRecord = [string, string, string, string]; // [name, folder, type, access]
export type InvoiceRecord = [string, string, string, string, string]; // [invId, vendor, amount, dueDate, status]
export type SyncJobRecord = [string, string, string, string, string]; // [jobId, name, target, lastRun, status]

export interface RecordsData {
  tickets: TicketRecord[];
  vendors: VendorRecord[];
  keys: KeyRecord[];
  docs: DocRecord[];
  invoices: InvoiceRecord[];
  jobs: SyncJobRecord[];
}
