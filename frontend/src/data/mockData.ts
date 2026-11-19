import type { AppDefinition, PageId, RecordsData } from '../types';

export const APPS: Record<Exclude<PageId, 'dashboard'>, AppDefinition> = {
  help: {
    id: 'help',
    name: 'HelpDeskr',
    desc: 'Support management · tickets, comments, attachments and audit history',
    icon: '▤',
    tabs: [
      'Tickets',
      'Comments & Notes',
      'Attachments',
      'Integration API',
      'Access Control',
      'Audit History',
    ],
  },
  blue: {
    id: 'blue',
    name: 'BlueVault',
    desc: 'Document management · folders, finance files, keys and access history',
    icon: '▣',
    tabs: [
      'Folders & Documents',
      'Finance Folder',
      'API Keys',
      'Permissions',
      'Access Logs',
    ],
  },
  ledger: {
    id: 'ledger',
    name: 'LedgerOne',
    desc: 'Financial management · vendors, invoices, payments and approvals',
    icon: '▥',
    tabs: [
      'Vendors',
      'Bank Details',
      'Invoices',
      'Payment Schedule',
      'Approvals',
      'Change History',
    ],
  },
  tally: {
    id: 'tally',
    name: 'TallyBridge',
    desc: 'Integration management · credentials, applications, sync jobs and API activity',
    icon: '⌘',
    tabs: [
      'API Keys',
      'Service Accounts',
      'Connected Apps',
      'Permissions',
      'Token & IP Controls',
      'Sync Jobs',
      'Build Host',
      'API Activity',
    ],
  },
};

export const INITIAL_RECORDS: RecordsData = {
  tickets: [
    ['HD-2048', 'Shipment documents access issue', 'Maya Chen', 'High', 'Open', 'Support Queue'],
    ['HD-2047', 'Invoice attachment missing', 'Arun Patel', 'Normal', 'In progress', 'Finance Support'],
    ['HD-2042', 'Vendor portal account update', 'Lena Morris', 'Low', 'Resolved', 'Support Queue'],
  ],
  vendors: [
    ['V-0412', 'Coastal Packaging Ltd.', '•••• 9083', 'Active', 'Pending review'],
    ['V-0388', 'Northstar Freight Co.', '•••• 4417', 'Active', 'Approved'],
    ['V-0291', 'Harbor Office Supplies', '•••• 7720', 'On hold', 'Needs review'],
  ],
  keys: [
    ['key-tb-07', 'Finance IT', 'read:write all-modules', 'No expiry', 'Not restricted', 'Active'],
    ['bvk-7f3a', 'Support Ops', 'read:all-folders', 'No expiry', 'Not restricted', 'Active'],
    ['key-tb-03', 'Legacy service', 'read:vendors', 'Expired', '10.20.4.0/24', 'Disabled'],
  ],
  docs: [
    ['Coastal_Packaging_Bank_Instructions.pdf', 'Finance / Vendor Bank Details', 'PDF', 'Restricted'],
    ['September_Payment_Run_Template.xlsx', 'Finance / Payment Runs', 'XLSX', 'Finance only'],
    ['August_Financial_Statement.pdf', 'Finance / Statements', 'PDF', 'Finance only'],
  ],
  invoices: [
    ['INV-9081', 'Coastal Packaging Ltd.', '₹2,48,000', '22 Nov 2026', 'Awaiting approval'],
    ['INV-9074', 'Northstar Freight Co.', '₹86,500', '20 Nov 2026', 'Scheduled'],
    ['INV-9068', 'Harbor Office Supplies', '₹32,800', '18 Nov 2026', 'Paid'],
  ],
  jobs: [
    ['SYNC-8821', 'Vendor master sync', 'LedgerOne', '19 Nov · 08:30', 'Completed'],
    ['SYNC-8819', 'Support ticket sync', 'HelpDeskr', '19 Nov · 08:00', 'Completed'],
    ['SYNC-8814', 'Document metadata sync', 'BlueVault', '19 Nov · 07:30', 'Warning'],
  ],
};
