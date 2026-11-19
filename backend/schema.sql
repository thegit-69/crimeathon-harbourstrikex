-- ============================================================
-- HarbourStrikeX simulation schema
-- Case CR-26-047 | Harbor & Finch Freight Pvt. Ltd.
-- Forensic state at: 2026-09-07 (investigation start)
-- ============================================================

-- Ensure role password is set
ALTER USER hsuser WITH PASSWORD 'hspassword';

-- Auth: human users
CREATE TABLE IF NOT EXISTS users (
    username      TEXT PRIMARY KEY,
    password_hash TEXT NOT NULL,
    role          TEXT DEFAULT 'staff',
    full_name     TEXT,
    status        TEXT DEFAULT 'active'
);

-- LedgerOne --------------------------------------------------
CREATE TABLE IF NOT EXISTS vendors (
    id           TEXT PRIMARY KEY,
    name         TEXT NOT NULL,
    bank_account TEXT,
    status       TEXT DEFAULT 'Active',
    approval     TEXT DEFAULT 'Pending review',
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bank_detail_changes (
    id           TEXT PRIMARY KEY,
    vendor_id    TEXT REFERENCES vendors(id),
    actor        TEXT,
    old_account  TEXT,
    new_account  TEXT,
    approval_ref TEXT,
    request_id   TEXT,
    changed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id        TEXT PRIMARY KEY,
    vendor_id TEXT,
    vendor    TEXT,
    amount    TEXT,
    due_date  TEXT,
    status    TEXT DEFAULT 'Awaiting approval'
);

CREATE TABLE IF NOT EXISTS scheduled_payments (
    id        TEXT PRIMARY KEY,
    vendor_id TEXT,
    vendor    TEXT,
    amount    TEXT,
    pay_date  TEXT,
    status    TEXT DEFAULT 'Scheduled'
);

CREATE TABLE IF NOT EXISTS ledger_api_logs (
    id          TEXT PRIMARY KEY,
    ts          TIMESTAMPTZ DEFAULT NOW(),
    api_key_id  TEXT,
    caller_ip   TEXT,
    user_agent  TEXT,
    method      TEXT,
    endpoint    TEXT,
    status_code TEXT,
    records_ret TEXT
);

-- HelpDeskr --------------------------------------------------
CREATE TABLE IF NOT EXISTS tickets (
    id          TEXT PRIMARY KEY,
    subject     TEXT NOT NULL,
    requester   TEXT,
    priority    TEXT DEFAULT 'Normal',
    status      TEXT DEFAULT 'Open',
    assigned_to TEXT DEFAULT 'Support Queue',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS export_jobs (
    id         TEXT PRIMARY KEY,
    actor      TEXT,
    caller_ip  TEXT,
    target     TEXT,
    status     TEXT DEFAULT 'Completed',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS helpdeskr_audit_logs (
    id         TEXT PRIMARY KEY,
    ts         TIMESTAMPTZ DEFAULT NOW(),
    actor      TEXT,
    event      TEXT,
    object_ref TEXT,
    result     TEXT DEFAULT 'Success'
);

-- BlueVault --------------------------------------------------
CREATE TABLE IF NOT EXISTS documents (
    id        TEXT PRIMARY KEY,
    name      TEXT,
    folder    TEXT,
    file_type TEXT,
    access    TEXT DEFAULT 'Restricted'
);

CREATE TABLE IF NOT EXISTS storage_keys (
    id          TEXT PRIMARY KEY,
    owner       TEXT,
    scope       TEXT,
    expiry      TEXT DEFAULT 'No expiry',
    ip_restrict TEXT DEFAULT 'Not restricted',
    status      TEXT DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS storage_access_logs (
    id         TEXT PRIMARY KEY,
    ts         TIMESTAMPTZ DEFAULT NOW(),
    principal  TEXT,
    path       TEXT,
    source_ip  TEXT,
    action     TEXT
);

-- TallyBridge ------------------------------------------------
CREATE TABLE IF NOT EXISTS api_keys (
    id          TEXT PRIMARY KEY,
    owner       TEXT,
    scope       TEXT,
    expiry      TEXT DEFAULT 'No expiry',
    ip_restrict TEXT DEFAULT 'Not restricted',
    status      TEXT DEFAULT 'Active',
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sync_jobs (
    id       TEXT PRIMARY KEY,
    name     TEXT,
    target   TEXT,
    last_run TEXT,
    status   TEXT DEFAULT 'Completed'
);

CREATE TABLE IF NOT EXISTS network_flows (
    id         TEXT PRIMARY KEY,
    ts         TIMESTAMPTZ DEFAULT NOW(),
    src_ip     TEXT,
    dst_ip     TEXT,
    host_label TEXT,
    bytes_sent TEXT,
    endpoint   TEXT,
    verdict    TEXT DEFAULT 'Allowed'
);

-- ============================================================
-- SEED DATA — CR-26-047 forensic state at 2026-09-07
-- ============================================================

-- Users (password: 'admin123' for a.kapoor, 'user123' for all others)
-- Verified bcrypt hashes
INSERT INTO users (username, password_hash, role, full_name, status) VALUES
  ('a.kapoor', '$2b$12$eT0aSOoiTTM0IaRr4uDoE.plOGGX64FNABSexQqhNvFo4Mo7.OiT.', 'it_admin',   'Aditi Kapoor',   'active'),
  ('m.sundar', '$2b$12$Z/l1DddRIXC64BT7xmzkouWQZo0D7fqUfhzH/q5rzZq4kKlHdzz2m', 'finance',    'Madhavi Sundar', 'active'),
  ('f.dsouza', '$2b$12$Z/l1DddRIXC64BT7xmzkouWQZo0D7fqUfhzH/q5rzZq4kKlHdzz2m', 'finance',    'Farah Dsouza',   'active'),
  ('s.iyer',   '$2b$12$Z/l1DddRIXC64BT7xmzkouWQZo0D7fqUfhzH/q5rzZq4kKlHdzz2m', 'support',    'Sunita Iyer',    'active'),
  ('p.menon',  '$2b$12$Z/l1DddRIXC64BT7xmzkouWQZo0D7fqUfhzH/q5rzZq4kKlHdzz2m', 'helpdesk',   'Prakash Menon',  'active'),
  ('r.menon',  '$2b$12$Z/l1DddRIXC64BT7xmzkouWQZo0D7fqUfhzH/q5rzZq4kKlHdzz2m', 'terminated', 'Rohan Menon',    'active')
ON CONFLICT (username) DO NOTHING;

-- Vendors (LedgerOne state Sep 7 — V-0412 already tampered)
INSERT INTO vendors (id, name, bank_account, status, approval, created_at) VALUES
  ('V-0412', 'Coastal Packaging Ltd.',  '•••• 9083', 'Active', 'Pending review', '2026-09-03 01:44:30+00'),
  ('V-0388', 'Northstar Freight Co.',   '•••• 4417', 'Active', 'Approved',        NOW()),
  ('V-0291', 'Harbor Office Supplies',  '•••• 7720', 'On hold','Needs review',    NOW())
ON CONFLICT (id) DO NOTHING;

-- THE ATTACK: Bank account tamper (03 Sep 2026, 01:44:30 UTC)
-- approval_ref = NULL → no authorization recorded — KEY forensic indicator
INSERT INTO bank_detail_changes (id, vendor_id, actor, old_account, new_account, approval_ref, request_id, changed_at) VALUES
  ('chg-8b9888c39b', 'V-0412', 'key-tb-07',    '•••• 4417', '•••• 9083', NULL,       'req-5f61b0de8', '2026-09-03 01:44:30+00'),
  ('chg-a1b2c3d4e5', 'V-0388', 'finance.user', '•••• 4100', '•••• 4417', 'APR-3312', 'req-b2c3d4e5f6','2026-09-02 09:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Invoices
INSERT INTO invoices (id, vendor_id, vendor, amount, due_date, status) VALUES
  ('INV-9081', 'V-0412', 'Coastal Packaging Ltd.', '248000', '2026-09-08', 'Awaiting approval'),
  ('INV-9074', 'V-0388', 'Northstar Freight Co.',  '86500',  '2026-11-20', 'Scheduled'),
  ('INV-9068', 'V-0291', 'Harbor Office Supplies',  '32800', '2026-11-18', 'Paid')
ON CONFLICT (id) DO NOTHING;

-- Scheduled payments — the Sep 8 payment run (attacker verified on Sep 6)
INSERT INTO scheduled_payments (id, vendor_id, vendor, amount, pay_date, status) VALUES
  ('PAY-V0412-0908', 'V-0412', 'Coastal Packaging Ltd.', '248000', '2026-09-08', 'Scheduled'),
  ('PAY-V0388-0920', 'V-0388', 'Northstar Freight Co.',  '86500',  '2026-09-20', 'Scheduled'),
  ('PAY-V0291-0923', 'V-0291', 'Harbor Office Supplies', '32800',  '2026-09-23', 'Scheduled')
ON CONFLICT (id) DO NOTHING;

-- LedgerOne API log (key attack events from E01/E18)
INSERT INTO ledger_api_logs (id, ts, api_key_id, caller_ip, user_agent, method, endpoint, status_code, records_ret) VALUES
  ('req-c28d87e49d','2026-08-09 03:12:00+00','key-tb-07','198.18.7.41','TallyBridge-Sync/3.5.0','GET','/api/v2/me','200','1'),
  ('req-6247db07f1','2026-07-22 06:10:00+00','user:f.dsouza','172.16.8.31','HF-Reports/1.8','GET','/api/v2/vendors/export','200','8800'),
  ('req-c35c2ccaff','2026-08-12 03:41:00+00','key-tb-07','198.18.7.41','TallyBridge-Sync/3.5.0','GET','/api/v2/vendors/export','200','9840'),
  ('req-d877f18b6c','2026-08-12 03:43:00+00','key-tb-07','198.18.7.41','TallyBridge-Sync/3.5.0','GET','/api/v2/exports/9931/download','200','9840'),
  ('req-2cb75d3eac','2026-08-12 04:02:00+00','key-tb-07','198.18.7.41','TallyBridge-Sync/3.5.0','DELETE','/api/v2/exports/9931','204','0'),
  ('req-15a052a5e', '2026-09-03 01:41:00+00','key-tb-07','10.20.4.77', 'TallyBridge-Sync/3.6.0','GET','/api/v2/vendors/V-0412','200','1'),
  ('req-93d66fcd5', '2026-09-03 01:41:30+00','key-tb-07','10.20.4.77', 'TallyBridge-Sync/3.6.0','GET','/api/v2/vendors/V-0412/bank-details','200','1'),
  ('req-33a3928eca','2026-09-03 01:42:00+00','key-tb-07','10.20.4.77', 'TallyBridge-Sync/3.6.0','GET','/api/v2/payments/scheduled','200','14'),
  ('req-5f61b0de8', '2026-09-03 01:44:30+00','key-tb-07','10.20.4.77', 'TallyBridge-Sync/3.6.0','PATCH','/api/v2/vendors/V-0412/bank-details','200','1'),
  ('req-bb819dfe0c','2026-09-06 01:36:00+00','key-tb-07','10.20.4.77', 'TallyBridge-Sync/3.6.0','GET','/api/v2/payments/scheduled','200','15')
ON CONFLICT (id) DO NOTHING;

-- Tickets
INSERT INTO tickets (id, subject, requester, priority, status, assigned_to, created_at) VALUES
  ('HD-2048',    'Shipment documents access issue', 'Maya Chen',   'High',   'Open',        'Support Queue',  NOW()),
  ('HD-2047',    'Invoice attachment missing',      'Arun Patel',  'Normal', 'In progress', 'Finance Support',NOW()),
  ('HD-2042',    'Vendor portal account update',    'Lena Morris', 'Low',    'Resolved',    'Support Queue',  NOW()),
  ('TKT-48213',  'BlueVault storage key issue',     'Sunita Iyer', 'Normal', 'Resolved',    'Support Queue',  '2026-06-25 06:01:00+00')
ON CONFLICT (id) DO NOTHING;

-- HelpDeskr export jobs — 10 malicious (EXP-5410 to EXP-5419) + 4 legitimate Tuesday exports
INSERT INTO export_jobs (id, actor, caller_ip, target, status, created_at) VALUES
  ('EXP-5410','tb-sync-svc','198.18.7.41','All tickets','Completed','2026-08-11 18:00:00+00'),
  ('EXP-5411','tb-sync-svc','198.18.7.41','All tickets','Completed','2026-08-11 18:08:00+00'),
  ('EXP-5412','tb-sync-svc','198.18.7.41','All tickets','Completed','2026-08-11 18:16:00+00'),
  ('EXP-5413','tb-sync-svc','198.18.7.41','All tickets','Completed','2026-08-11 18:24:00+00'),
  ('EXP-5414','tb-sync-svc','198.18.7.41','All tickets','Completed','2026-08-11 18:32:00+00'),
  ('EXP-5415','tb-sync-svc','198.18.7.41','All tickets','Completed','2026-08-11 18:40:00+00'),
  ('EXP-5416','tb-sync-svc','198.18.7.58','All tickets','Completed','2026-08-11 18:48:00+00'),
  ('EXP-5417','tb-sync-svc','198.18.7.58','All tickets','Completed','2026-08-11 18:56:00+00'),
  ('EXP-5418','tb-sync-svc','198.18.7.58','All tickets','Completed','2026-08-11 19:00:00+00'),
  ('EXP-5419','tb-sync-svc','198.18.7.58','All tickets','Failed',   '2026-08-11 19:03:00+00'),
  ('EXP-5400','s.iyer',     '172.16.9.21','Weekly report','Completed','2026-08-05 04:30:00+00'),
  ('EXP-5401','s.iyer',     '172.16.9.21','Weekly report','Completed','2026-08-12 04:30:00+00'),
  ('EXP-5402','s.iyer',     '172.16.9.21','Weekly report','Completed','2026-08-19 04:30:00+00'),
  ('EXP-5403','s.iyer',     '172.16.9.21','Weekly report','Completed','2026-08-26 04:30:00+00')
ON CONFLICT (id) DO NOTHING;

-- HelpDeskr audit log
INSERT INTO helpdeskr_audit_logs (id, ts, actor, event, object_ref, result) VALUES
  ('evt-3fe76f60c4','2026-08-11 19:03:00+00','tb-sync-svc','export.delete','EXP-5419','Failed'),
  ('evt-a1b2c3d4e5','2026-08-11 18:00:00+00','tb-sync-svc','export.create','EXP-5410','Success'),
  ('evt-b2c3d4e5f6','2026-08-12 03:41:00+00','key-tb-07',  'export.create','EXP-9931', 'Success')
ON CONFLICT (id) DO NOTHING;

-- BlueVault storage keys
INSERT INTO storage_keys (id, owner, scope, expiry, ip_restrict, status) VALUES
  ('bvk-7f3a', 'Support Ops',  'read:all-folders',  'No expiry', 'Not restricted', 'Active'),
  ('bvk-9a2c', 'Finance Team', 'read:write:finance', 'No expiry', '172.16.0.0/16', 'Active')
ON CONFLICT (id) DO NOTHING;

-- BlueVault documents
INSERT INTO documents (id, name, folder, file_type, access) VALUES
  ('doc-001','vendor-bank-details-2026.xlsx',           'Finance / Vendor Bank Details','XLSX','Restricted'),
  ('doc-002','payment-run-template.xlsx',               'Finance / Payment Runs',       'XLSX','Finance only'),
  ('doc-003','stmt-2026-01.pdf',                        'Finance / Statements',          'PDF', 'Finance only'),
  ('doc-004','stmt-2026-02.pdf',                        'Finance / Statements',          'PDF', 'Finance only'),
  ('doc-005','Coastal_Packaging_Bank_Instructions.pdf', 'Finance / Vendor Bank Details', 'PDF', 'Restricted'),
  ('doc-006','shipment_manifest_sample.pdf',            'Shipment Records',              'PDF', 'Internal')
ON CONFLICT (id) DO NOTHING;

-- BlueVault access logs (attack events from E05)
INSERT INTO storage_access_logs (id, ts, principal, path, source_ip, action) VALUES
  ('bv-edb0081dad','2026-08-14 21:16:00+00','key:bvk-7f3a','/finance/bank-instructions/vendor-bank-details-2026.xlsx','198.18.7.23','read'),
  ('bv-94baddc5d7','2026-08-14 21:31:00+00','key:bvk-7f3a','/finance/bank-instructions/payment-run-template.xlsx',    '198.18.7.24','read'),
  ('bv-a1234bcdef','2026-08-14 21:06:00+00','key:bvk-7f3a','/',                                                       '198.18.7.24','list'),
  ('bv-b2345cdefa','2026-08-14 21:12:00+00','key:bvk-7f3a','/finance/statements/stmt-2026-01.pdf',                    '198.18.7.23','read'),
  ('bv-c3456defab','2026-09-02 11:05:00+00','support.agent','/customer-documents/',                                   '172.16.9.40','read')
ON CONFLICT (id) DO NOTHING;

-- TallyBridge API Keys (Connected Software Register E04)
INSERT INTO api_keys (id, owner, scope, expiry, ip_restrict, status, created_at) VALUES
  ('key-tb-07',  'Finance IT',   'read:write all-modules', 'No expiry', 'Not restricted', 'Active', '2024-06-12 00:00:00+00'),
  ('tb-sync-svc','Support Ops',  'admin',                  'No expiry', 'Not restricted', 'Active', '2024-06-12 00:00:00+00'),
  ('key-tb-03',  'Legacy service','read:vendors',           'Expired',   '10.20.4.0/24',  'Active', '2022-01-01 00:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Sync jobs
INSERT INTO sync_jobs (id, name, target, last_run, status) VALUES
  ('SYNC-8821','Vendor master sync',      'LedgerOne', '2026-11-19 03:00:00+00','Completed'),
  ('SYNC-8819','Support ticket sync',     'HelpDeskr', '2026-11-19 02:30:00+00','Completed'),
  ('SYNC-8814','Document metadata sync',  'BlueVault', '2026-11-19 02:00:00+00','Warning')
ON CONFLICT (id) DO NOTHING;

-- Network flows — rogue tb-build-02 (10.20.4.77) traffic (E15)
-- This is the evidence of supply-chain compromise via private link
INSERT INTO network_flows (id, ts, src_ip, dst_ip, host_label, bytes_sent, endpoint, verdict) VALUES
  ('flow-001','2026-07-09 22:00:00+00','10.20.4.77','172.16.4.10','tb-build-02','0.1MB', '/api/v2/schema (sandbox)',              'Allowed'),
  ('flow-002','2026-08-17 12:10:00+00','10.20.4.77','172.16.4.10','tb-build-02','6.3MB', '/api/v2/vendors/bank-details',          'Allowed'),
  ('flow-003','2026-08-18 12:10:00+00','10.20.4.77','172.16.4.10','tb-build-02','9.6MB', '/api/v2/payments/export',               'Allowed'),
  ('flow-004','2026-08-19 12:10:00+00','10.20.4.77','172.16.4.10','tb-build-02','6.2MB', '/api/v2/vendors/bank-details',          'Allowed'),
  ('flow-005','2026-09-03 01:40:00+00','10.20.4.77','172.16.4.10','tb-build-02','0.01MB','/api/v2/vendors/V-0412',                'Allowed'),
  ('flow-006','2026-09-03 01:44:00+00','10.20.4.77','172.16.4.10','tb-build-02','0.01MB','/api/v2/vendors/V-0412/bank-details PATCH','Allowed'),
  ('flow-007','2026-09-06 01:36:00+00','10.20.4.77','172.16.4.10','tb-build-02','0.01MB','/api/v2/payments/scheduled',            'Allowed')
ON CONFLICT (id) DO NOTHING;
