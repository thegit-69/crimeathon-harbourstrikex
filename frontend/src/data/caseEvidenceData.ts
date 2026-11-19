// CRIMEATHON '26 - Comprehensive Forensic Case Evidence & Context Data
// Case File: CR-26-047 | Harbor & Finch Freight Pvt. Ltd.
// Correlated across all 20 evidence files (E01 - E20)

export interface CaseMetadata {
  caseId: string;
  targetCompany: string;
  industry: string;
  headquarters: string;
  depots: string[];
  employeesCount: number;
  customerCount: number;
  vendorCount: number;
  paymentDisbursementDates: string;
  leadInvestigatorRequest: string;
  investigationCommissionDate: string;
  criticalUpcomingDeadline: string;
  highRiskTargetVendor: {
    id: string;
    name: string;
    originalBank: string;
    tamperedBank: string;
    invoiceId: string;
    amount: string;
    scheduledDate: string;
  };
}

export const CASE_METADATA: CaseMetadata = {
  caseId: 'CR-26-047',
  targetCompany: 'Harbor & Finch Freight Pvt. Ltd.',
  industry: 'Freight Logistics & Warehousing',
  headquarters: 'Chennai, Tamil Nadu, India',
  depots: ['Chennai', 'Coimbatore', 'Madurai'],
  employeesCount: 420,
  customerCount: 1400,
  vendorCount: 300,
  paymentDisbursementDates: '8th and 23rd of every month',
  leadInvestigatorRequest: 'Dev Raghavan (General Manager)',
  investigationCommissionDate: '2026-09-07',
  criticalUpcomingDeadline: '2026-09-08 (Bi-monthly Payment Disbursement Run)',
  highRiskTargetVendor: {
    id: 'V-0412',
    name: 'Coastal Packaging Ltd.',
    originalBank: '•••• 4417',
    tamperedBank: '•••• 9083',
    invoiceId: 'INV-9081',
    amount: '₹2,48,000',
    scheduledDate: '08 Sep 2026',
  },
};

export interface EvidenceItem {
  id: string;
  name: string;
  format: string;
  source: string;
  period: string;
  clockTraits: string;
  status: 'Analyzed' | 'Flagged' | 'Verified';
  summaryFinding: string;
  provenFacts: string[];
}

export const EVIDENCE_INVENTORY: EvidenceItem[] = [
  {
    id: 'E01',
    name: 'LedgerOne API Access Log (Jun-Aug)',
    format: 'CSV (36,183 rows)',
    source: 'Finance System',
    period: '03 Jun – 31 Aug 2026',
    clockTraits: 'UTC (retention 90 days only)',
    status: 'Analyzed',
    summaryFinding: 'External IP token probe on 09 Aug, mass vendor exfiltration on 12 Aug, rogue IP queries on 17-19 Aug.',
    provenFacts: [
      '09 Aug: req-c28d87e49d probes /v2/me and /v2/schema from external untrusted IP 198.18.7.41 using key-tb-07',
      '12 Aug: req-c35c2ccaff generates export 9931 (9,840 records), downloaded via req-d877f18b6c',
      '12 Aug: req-2cb75d3eac deletes export 9931 to suppress audit traces',
      '17-19 Aug: Rogue build host 10.20.4.77 executes 56 targeted queries into bank details and payment schedules',
    ],
  },
  {
    id: 'E02',
    name: 'HelpDeskr Audit Log',
    format: 'CSV (25,390 rows)',
    source: 'Support SaaS',
    period: '01 Jul – 31 Aug 2026',
    clockTraits: 'IST (UTC+5:30) Tenant Local Time',
    status: 'Analyzed',
    summaryFinding: '10 bulk ticket exports executed by tb-sync-svc on 11-12 Aug; export delete timeout preserved forensics.',
    provenFacts: [
      '11 Aug 23:30 IST to 12 Aug 00:29 IST: tb-sync-svc creates EXP-5410 through EXP-5419 from 198.18.7.41/.58',
      'Harvests entire customer ticket database including configuration credentials and TKT-48213',
      '12 Aug 00:33 IST: export.delete fails with timeout on EXP-5419 (evt-3fe76f60c4), leaving permanent trace',
      'Weekly legitimate Tuesday exports by Sunita Iyer: EXP-5408, EXP-5409, EXP-5420, EXP-5421',
    ],
  },
  {
    id: 'E03',
    name: 'SSO Sign-in Log',
    format: 'CSV (27,412 rows)',
    source: 'Identity Engine (SSO)',
    period: '01 Jun – 31 Aug 2026',
    clockTraits: 'UTC (Device ID blank prior to 20 June)',
    status: 'Analyzed',
    summaryFinding: 'Terminated employee Rohan Menon logged into warehouse kiosk dev-81546 on 13 Aug without MFA.',
    provenFacts: [
      '13 Aug 09:02 UTC: r.menon signs into physical terminal dev-81546 (sso-bb8ab61e08)',
      'Rohan Menon formally exited 30 June 2026 but his SSO credentials were never deactivated',
      'Colin Lawson (network contractor) logins confirmed legitimate multi-city contractor activity',
    ],
  },
  {
    id: 'E04',
    name: 'Connected Software Register',
    format: 'JSON (8 entries)',
    source: 'IT Systems Registry',
    period: 'Current snapshot (02 Sep 2026)',
    clockTraits: 'Static snapshot (zero change history)',
    status: 'Analyzed',
    summaryFinding: 'Critical machine keys key-tb-07, tb-sync-svc, and bvk-7f3a have NO IP restrictions and infinite lifetime.',
    provenFacts: [
      'key-tb-07 has read:write all-modules scope, token_lifetime_days: null, ip_restriction: false',
      'tb-sync-svc has admin scope, token_lifetime_days: null, ip_restriction: false',
      'bvk-7f3a has read:all-folders scope, token_lifetime_days: null, ip_restriction: false',
      'Legacy key key-tb-03 created March 2023 remains active despite being superseded',
    ],
  },
  {
    id: 'E05',
    name: 'BlueVault Access Log',
    format: 'CSV (7,914 rows)',
    source: 'Shared File Storage',
    period: '03 Jun – 31 Aug 2026',
    clockTraits: 'Unix Epoch (hardware clock fast, missing IPs on 679 rows)',
    status: 'Analyzed',
    summaryFinding: 'Storage key bvk-7f3a abused from external IPs on 14-16 Aug to exfiltrate master vendor bank sheets.',
    provenFacts: [
      '14 Aug 21:16 UTC: bvk-7f3a from 198.18.7.23 downloads vendor-bank-details-2026.xlsx (bv-edb0081dad)',
      '14 Aug 21:31 UTC: bvk-7f3a from 198.18.7.24 downloads payment-run-template.xlsx (bv-94baddc5d7)',
      '14-16 Aug: 13 monthly financial statements (stmt-2026-01 to 05.pdf) downloaded from 198.18.7.23/.24/.77',
    ],
  },
  {
    id: 'E06',
    name: 'HelpDeskr Billing Alert & Invoice',
    format: 'PDF (2 pages)',
    source: 'Vendor Billing',
    period: 'August 2026',
    clockTraits: 'Local Billing Period',
    status: 'Analyzed',
    summaryFinding: 'Invoice INV-HD-2026-0831 bills for 14 export jobs (5 included + 9 excess @ ₹2,500 = ₹22,500 overage).',
    provenFacts: [
      'Perfect match: 4 legitimate Tuesday exports + 10 attacker exports = 14 total exports billed',
      'Contract rule: export jobs count when created, regardless of whether they are deleted',
      'Finance Manager Madhavi Sundar forwarded notice as an accounting accrual, missing the breach',
    ],
  },
  {
    id: 'E07',
    name: 'Vendor Onboarding Review File',
    format: 'PDF (1 page)',
    source: 'IT Procurement',
    period: '05 June 2024',
    clockTraits: 'Historical',
    status: 'Analyzed',
    summaryFinding: 'TallyBridge approved despite SOC 2 Type 2 report carving out the credential vault service.',
    provenFacts: [
      'SOC 2 report Page 7 carve-out excluded the credential vault storing customer API tokens',
      'Penetration test summary was available but never requested by Pradeep Shah',
      'Mandatory annual review for June 2025 was completely skipped',
      'Vendor questionnaire recommended IP restriction on keys, but Harbor & Finch left them open',
    ],
  },
  {
    id: 'E08',
    name: 'Master Services Agreement (Contract Excerpt)',
    format: 'PDF (1 page)',
    source: 'Legal / Contract File',
    period: '10 June 2024',
    clockTraits: 'Effective Date',
    status: 'Analyzed',
    summaryFinding: 'Clause 14.3 shifts 100% loss liability to customer if customer fails to configure IP/expiry controls.',
    provenFacts: [
      'Clause 5.3 placed duty on customer to configure IP and expiration restrictions',
      'Clause 14.3: Vendor is NOT liable for losses resulting from unrestricted credentials',
      'Clause 7.4 protects vendor from having to disclose internal technical incident details',
    ],
  },
  {
    id: 'E09',
    name: 'Risk Register Extract',
    format: 'XLSX Workbook',
    source: 'Finance / IT Risk Management',
    period: 'Last exported 02 Sep 2026',
    clockTraits: 'Current Snapshot',
    status: 'Analyzed',
    summaryFinding: 'Critical vendor integration risk R-031 was accepted as LOW by Finance Manager to bypass controls.',
    provenFacts: [
      'Risk R-031 (Third-party connector compromise) was rated LOW and ACCEPTED by Madhavi Sundar',
      'Risk R-029 (Storage key bvk-7f3a rotation) marked "Not done. Review overdue"',
      'Risk R-018 (Staff accounts active after termination) left open without remediation',
    ],
  },
  {
    id: 'E10',
    name: 'IT Security Policy v2.1 (TPS-POL-02)',
    format: 'PDF (2 pages)',
    source: 'IT Governance',
    period: 'Effective 01 Jan 2025',
    clockTraits: 'Policy Mandates',
    status: 'Analyzed',
    summaryFinding: 'Section 1 mandates HIGH risk for financial write access; 90-day rotation deadline expired Jan 2026.',
    provenFacts: [
      'Section 1: Any integration with write access to financial systems is classified HIGH RISK',
      'Section 2.1 & 2.2: Mandatory IP restriction and 90-day credential rotation',
      'Section 4.1: Mandatory alerting on bulk exports and job deletions',
      'Section 7.1: Pre-existing integrations had until 01 Jan 2026 grace period; completely ignored',
    ],
  },
  {
    id: 'E11',
    name: 'Internal Audit Report IA-2025-09',
    format: 'PDF (1 page)',
    source: 'Internal Audit Committee',
    period: '12 Sep 2025',
    clockTraits: 'Annual Audit Report',
    status: 'Analyzed',
    summaryFinding: 'All 7 audit findings predicted the breach; management left 100% of technical findings OPEN.',
    provenFacts: [
      'Finding F2 (High): Pasted credentials and customer secrets inside HelpDeskr tickets (OPEN)',
      'Finding F3 (Med): Departed employee accounts not disabled promptly (OPEN)',
      'Finding F4 (High): 5 of 8 integration keys have no expiry and no IP limits (OPEN)',
      'Finding F5 (Med): Stale integration keys remain active (key-tb-03) (OPEN)',
      'Finding F6 (High): Zero alerting for bulk exports and export deletions (OPEN)',
    ],
  },
  {
    id: 'E12',
    name: 'Partner Security Notice (21 Aug)',
    format: 'PDF (1 page)',
    source: 'TallyBridge Trust Team',
    period: '21 Aug 2026',
    clockTraits: 'IST Notification',
    status: 'Analyzed',
    summaryFinding: 'Vague precaution advisory sent to accounts@ inbox, completely bypassing IT Security.',
    provenFacts: [
      'Sent to accounts@harborfinch.example; IT Security administrator Aditi Kapoor was omitted',
      'Downplayed event as a routine precaution; failed to disclose compromised machine tokens',
      'Arrived 9 days after attacker had already exfiltrated tickets and vendor databases',
    ],
  },
  {
    id: 'E13',
    name: 'Support Team Chat Export',
    format: 'JSON (16 messages)',
    source: 'Internal Support Chat',
    period: '25 Jun – 28 Aug 2026',
    clockTraits: 'Local Chat Export',
    status: 'Analyzed',
    summaryFinding: 'Smoking gun on storage key leak: Sunita Iyer had customer paste bvk-7f3a into ticket TKT-48213.',
    provenFacts: [
      '25 Jun 11:31: Sunita Iyer notes storage key bvk-7f3a was pasted into ticket TKT-48213',
      'Colleague a.nair warned about audit findings; Sunita dismissed it ("I will tidy the ticket later")',
      '12 Aug: Stuck export job EXP-5419 noticed by a.nair, dismissed as normal sync noise',
      '13 Aug: Prakash Menon flags Rohan Menon kiosk login still functioning',
      '16 Aug: Aditi Kapoor observes 3 failed admin logins against her account, assumes random bot',
    ],
  },
  {
    id: 'E14',
    name: 'Staff Roster Export',
    format: 'CSV (420 rows)',
    source: 'Human Resources',
    period: 'Current snapshot (Aug 2026)',
    clockTraits: 'HR Database Export',
    status: 'Analyzed',
    summaryFinding: 'Systemic offboarding failure: all 8 terminated employees are still listed with status: active.',
    provenFacts: [
      'Rohan Menon (HF0004, Accounts Payable Clerk) terminated 30 June 2026, status still active',
      '7 other terminated employees (s.reddy, s.nair, k.mehta, d.das, m.sheikh, r.joshi, t.raman) active',
      'Total inactive employees listed across the entire 420-person company: 0',
    ],
  },
  {
    id: 'E15',
    name: 'Private-Link Network Flow Log',
    format: 'CSV (9,790 rows)',
    source: 'Tunnel Gateway (10.20.4.0/24)',
    period: '03 Jun – 31 Aug 2026',
    clockTraits: 'UTC',
    status: 'Analyzed',
    summaryFinding: 'Rogue vendor build server tb-build-02 (10.20.4.77) pulled 22.2 MB from LedgerOne production.',
    provenFacts: [
      '09 July 22:00-22:52 UTC: tb-build-02 probes LedgerOne-sandbox (10 flows, 331 KB transferred)',
      '17-19 Aug: tb-build-02 executes 55 flows to LedgerOne production transferring 22,215,099 bytes (22.2 MB)',
      '1-to-1 correlation with the 56 LedgerOne API calls querying bank details and payment exports in E01',
      'Legitimate sync nodes are strictly 10.20.4.11 through 10.20.4.16 operating at 01:00-03:00 UTC',
    ],
  },
  {
    id: 'E16',
    name: 'Follow-up Email Notice (28 Aug)',
    format: 'PDF (1 page)',
    source: 'TallyBridge Trust Team',
    period: '28 Aug 2026',
    clockTraits: 'IST Notification',
    status: 'Analyzed',
    summaryFinding: 'TallyBridge falsely claims no finance data accessed and private link uninvolved (proven cover-up).',
    provenFacts: [
      'Vendor claims incident was confined to 11-12 August; disproved by E01/E15/E18',
      'Vendor claims private tunnel was unaffected; disproved by 10.20.4.77 in E15 and E18',
      'Vendor claims finance data was never accessed; disproved by 22.2MB bank data extraction in E01/E15',
    ],
  },
  {
    id: 'E17',
    name: 'Indicator List (Partner IOCs)',
    format: 'CSV (5 rows)',
    source: 'TallyBridge Attachment',
    period: '28 Aug 2026',
    clockTraits: 'External Intelligence',
    status: 'Analyzed',
    summaryFinding: 'Defective IOC feed deliberately omitted 10.20.4.77 and BlueVault attack IPs 198.18.7.23/.24/.77.',
    provenFacts: [
      'Provided 198.18.7.41, 198.18.7.58, 198.18.8.6, and python-requests/2.31.0',
      'Omitted internal private link IP 10.20.4.77 (tb-build-02)',
      'Omitted BlueVault attack IPs 198.18.7.23, 198.18.7.24, 198.18.7.77',
      'Teams relying solely on vendor IOCs would completely miss the LedgerOne bank account tampering',
    ],
  },
  {
    id: 'E18',
    name: 'LedgerOne API Access Log (1-7 Sep)',
    format: 'CSV (2,891 rows)',
    source: 'Finance System',
    period: '01 Sep – 07 Sep 2026',
    clockTraits: 'UTC',
    status: 'Analyzed',
    summaryFinding: 'Fraud Execution: req-5f61b0de8 patches Coastal Packaging Ltd bank account on 03 Sep at 01:44:30 UTC.',
    provenFacts: [
      '03 Sep 01:41 UTC: req-15a052a5e inspects Coastal Packaging Ltd (V-0412)',
      '03 Sep 01:41 UTC: req-93d66fcd5 inspects existing bank details (****4417)',
      '03 Sep 01:42 UTC: req-33a3928eca inspects upcoming scheduled payments',
      '03 Sep 01:44:30 UTC: req-5f61b0de8 PATCH /v2/vendors/V-0412/bank-details replaces account with ****9083',
      '06 Sep 01:36 UTC: req-bb819dfe0c re-verifies fraudulent account is locked in for Sep 8 payment run',
    ],
  },
  {
    id: 'E19',
    name: 'Vendor Master Change Log',
    format: 'CSV (367 rows)',
    source: 'Finance System Audit',
    period: '03 Jun – 07 Sep 2026',
    clockTraits: 'UTC',
    status: 'Analyzed',
    summaryFinding: 'Change chg-8b9888c39b is the ONLY bank account change in company history via API, with BLANK approval.',
    provenFacts: [
      'Change chg-8b9888c39b: V-0412 bank_account altered from ****4417 to ****9083 on 03 Sep at 01:44:30 UTC',
      'Channel is API (all other 39 bank account changes were via UI or month-end bulk import)',
      'Changed by key-tb-07; approval_reference is NaN (completely blank)',
      'Originating IP is 10.20.4.77 (TallyBridge build host tb-build-02)',
    ],
  },
  {
    id: 'E20',
    name: 'Public Records Pack (OSINT)',
    format: 'PDF (3 pages)',
    source: 'Public Web Captures / OSINT',
    period: 'Saved 02 Sep 2026',
    clockTraits: 'OSINT Sources',
    status: 'Analyzed',
    summaryFinding: 'Confirms TallyBridge build host tb-build-02 was re-imaged on 16 Aug following supply chain breach.',
    provenFacts: [
      'TallyBridge Status Page: 16 Aug 18:00-21:00 UTC re-provisioning of internal build host tb-build-02',
      'Attacker regained access or retained secondary credentials to attack Harbor & Finch on 17-19 Aug & 03 Sep',
      'Public reports show supply chain compromise impacting multiple enterprise customers',
    ],
  },
];

export interface IncidentTimelineEvent {
  id: string;
  utcTimestamp: string;
  istTimestamp: string;
  system: string;
  sourceKey: string;
  sourceIp: string;
  endpointAction: string;
  recordsVolume: string;
  phase: string;
  severity: 'critical' | 'high' | 'medium' | 'info';
  findingDescription: string;
  evidenceIds: string[];
}

export const INCIDENT_CHRONOLOGY: IncidentTimelineEvent[] = [
  {
    id: 'EVT-01',
    utcTimestamp: '2024-06-05 04:30:00',
    istTimestamp: '2024-06-05 10:00:00',
    system: 'Governance / Due Diligence',
    sourceKey: 'p.shah / m.sundar',
    sourceIp: '172.16.8.10',
    endpointAction: 'Vendor Review Approval',
    recordsVolume: '1 Onboarding File',
    phase: 'Pre-Attack Governance Flaw',
    severity: 'high',
    findingDescription: 'TallyBridge approved despite SOC 2 excluding credential vault. Risk R-031 formally accepted as LOW.',
    evidenceIds: ['E07', 'E09'],
  },
  {
    id: 'EVT-02',
    utcTimestamp: '2024-06-10 09:00:00',
    istTimestamp: '2024-06-10 14:30:00',
    system: 'Legal / MSA',
    sourceKey: 'Contract Execution',
    sourceIp: 'Corporate Legal',
    endpointAction: 'Sign Agreement TB-HF-2024-017',
    recordsVolume: '1 MSA Contract',
    phase: 'Liability Trap',
    severity: 'medium',
    findingDescription: 'Clause 14.3 legally indemnifies TallyBridge because customer failed to restrict API keys under Clause 5.3.',
    evidenceIds: ['E08'],
  },
  {
    id: 'EVT-03',
    utcTimestamp: '2024-06-12 05:00:00',
    istTimestamp: '2024-06-12 10:30:00',
    system: 'Registry (E04)',
    sourceKey: 'IT Systems Admin',
    sourceIp: '172.16.8.15',
    endpointAction: 'Key Provisioning',
    recordsVolume: '3 Integration Keys',
    phase: 'Root Control Gap',
    severity: 'high',
    findingDescription: 'key-tb-07, tb-sync-svc, and bvk-7f3a created with infinite lifetimes and no IP allowlisting.',
    evidenceIds: ['E04'],
  },
  {
    id: 'EVT-04',
    utcTimestamp: '2025-01-01 00:00:00',
    istTimestamp: '2025-01-01 05:30:00',
    system: 'IT Security Policy',
    sourceKey: 'CISO Office',
    sourceIp: '172.16.0.1',
    endpointAction: 'Policy TPS-POL-02 Enacted',
    recordsVolume: '1 Formal Policy',
    phase: 'Policy Mandate',
    severity: 'info',
    findingDescription: 'Mandated 90-day rotation and IP restrictions. 1-year grandfather transition period established.',
    evidenceIds: ['E10'],
  },
  {
    id: 'EVT-05',
    utcTimestamp: '2025-09-12 08:00:00',
    istTimestamp: '2025-09-12 13:30:00',
    system: 'Internal Audit',
    sourceKey: 'Audit Committee',
    sourceIp: 'Internal Audit',
    endpointAction: 'Report IA-2025-09 Issued',
    recordsVolume: '7 Audit Findings',
    phase: 'Ignored Warnings',
    severity: 'high',
    findingDescription: 'Internal audit flagged unrotated integration keys (F4), unmonitored exports (F6), and orphan accounts (F3). Management resolved zero items.',
    evidenceIds: ['E11'],
  },
  {
    id: 'EVT-06',
    utcTimestamp: '2026-01-01 00:00:00',
    istTimestamp: '2026-01-01 05:30:00',
    system: 'Governance',
    sourceKey: 'IT Management',
    sourceIp: 'Harbor & Finch',
    endpointAction: 'Grace Period Expired',
    recordsVolume: '0 Remediations',
    phase: 'Compliance Deadline Blown',
    severity: 'high',
    findingDescription: 'Policy v2.1 grandfather deadline expired with all machine integration credentials non-compliant.',
    evidenceIds: ['E10'],
  },
  {
    id: 'EVT-07',
    utcTimestamp: '2026-06-25 06:01:00',
    istTimestamp: '2026-06-25 11:31:00',
    system: 'Support Chat / HelpDeskr',
    sourceKey: 's.iyer (Sunita Iyer)',
    sourceIp: '172.16.4.22',
    endpointAction: 'Pasted into TKT-48213',
    recordsVolume: 'Storage Key bvk-7f3a',
    phase: 'Credential Leak',
    severity: 'critical',
    findingDescription: 'Sunita Iyer had Pune depot customer paste storage key bvk-7f3a into ticket TKT-48213; ignored audit warning.',
    evidenceIds: ['E13', 'E11'],
  },
  {
    id: 'EVT-08',
    utcTimestamp: '2026-06-30 18:00:00',
    istTimestamp: '2026-06-30 23:30:00',
    system: 'HR Roster',
    sourceKey: 'HR Operations',
    sourceIp: '172.16.2.14',
    endpointAction: 'Employee Exit',
    recordsVolume: '8 Terminated Staff',
    phase: 'Offboarding Flaw',
    severity: 'medium',
    findingDescription: 'Rohan Menon and 7 other staff terminated; HR left their SSO accounts marked active.',
    evidenceIds: ['E14'],
  },
  {
    id: 'EVT-09',
    utcTimestamp: '2026-07-09 22:00:00',
    istTimestamp: '2026-07-10 03:30:00',
    system: 'Private Link Tunnel',
    sourceKey: 'tb-build-02',
    sourceIp: '10.20.4.77',
    endpointAction: 'Tunnel to LedgerOne-sandbox',
    recordsVolume: '10 flows / 331 KB',
    phase: 'Phase 0: Staging Recon',
    severity: 'medium',
    findingDescription: 'Compromised vendor build host probes LedgerOne-sandbox staging environment over private link.',
    evidenceIds: ['E15'],
  },
  {
    id: 'EVT-10',
    utcTimestamp: '2026-07-22 06:10:00',
    istTimestamp: '2026-07-22 11:40:00',
    system: 'Finance (LedgerOne)',
    sourceKey: 'f.dsouza (Senior Accountant)',
    sourceIp: '172.16.8.31',
    endpointAction: 'POST /v2/vendors/export',
    recordsVolume: '8,800 records',
    phase: 'Legitimate Baseline',
    severity: 'info',
    findingDescription: 'Internal audit export by Senior Accountant (req-6247db07f1) establishing normal baseline profile.',
    evidenceIds: ['E01', 'E13'],
  },
  {
    id: 'EVT-11',
    utcTimestamp: '2026-08-09 03:12:00',
    istTimestamp: '2026-08-09 08:42:00',
    system: 'Finance (LedgerOne)',
    sourceKey: 'key-tb-07 (Attacker)',
    sourceIp: '198.18.7.41',
    endpointAction: 'GET /v2/me & /v2/schema',
    recordsVolume: 'API Schema Metadata',
    phase: 'Phase 1: API Reconnaissance',
    severity: 'high',
    findingDescription: 'Attacker validates token scope and maps endpoint schema from untrusted external IP (req-c28d87e49d).',
    evidenceIds: ['E01'],
  },
  {
    id: 'EVT-12',
    utcTimestamp: '2026-08-11 18:00:00',
    istTimestamp: '2026-08-11 23:30:00',
    system: 'Support (HelpDeskr)',
    sourceKey: 'tb-sync-svc (Attacker)',
    sourceIp: '198.18.7.41',
    endpointAction: 'export.create & download',
    recordsVolume: 'EXP-5410 (25,390 tickets)',
    phase: 'Phase 2: Ticket Theft',
    severity: 'critical',
    findingDescription: 'Attacker executes unauthorized bulk export of entire ticket database, harvesting leaked key in TKT-48213.',
    evidenceIds: ['E02', 'E06'],
  },
  {
    id: 'EVT-13',
    utcTimestamp: '2026-08-11 18:08:00',
    istTimestamp: '2026-08-11 23:38:00',
    system: 'Support (HelpDeskr)',
    sourceKey: 'tb-sync-svc (Attacker)',
    sourceIp: '198.18.7.41 / .58',
    endpointAction: '9x export.create & download',
    recordsVolume: 'EXP-5411 through EXP-5419',
    phase: 'Phase 2: Mass Harvesting',
    severity: 'critical',
    findingDescription: 'Rapid harvesting of all customer and support data. Anti-forensic delete fails on EXP-5419 (timeout).',
    evidenceIds: ['E02', 'E06', 'E13'],
  },
  {
    id: 'EVT-14',
    utcTimestamp: '2026-08-12 03:41:00',
    istTimestamp: '2026-08-12 09:11:00',
    system: 'Finance (LedgerOne)',
    sourceKey: 'key-tb-07 (Attacker)',
    sourceIp: '198.18.7.41 / .58',
    endpointAction: 'POST /v2/vendors/export & GET 9931',
    recordsVolume: '9,840 vendor master records',
    phase: 'Phase 3: Vendor Exfiltration',
    severity: 'critical',
    findingDescription: 'Attacker downloads entire vendor master database (req-c35c2ccaff) and immediately deletes job (req-2cb75d3eac).',
    evidenceIds: ['E01'],
  },
  {
    id: 'EVT-15',
    utcTimestamp: '2026-08-13 09:02:00',
    istTimestamp: '2026-08-13 14:32:00',
    system: 'Identity (SSO)',
    sourceKey: 'r.menon (Rohan Menon)',
    sourceIp: '172.16.8.44',
    endpointAction: 'SSO Login on dev-81546 kiosk',
    recordsVolume: 'Physical Kiosk Session',
    phase: 'Decoy / Orphan Account',
    severity: 'high',
    findingDescription: 'Terminated accounts payable clerk credentials log in on terminal dev-81546 without MFA (Note 92).',
    evidenceIds: ['E03', 'E13', 'E14'],
  },
  {
    id: 'EVT-16',
    utcTimestamp: '2026-08-14 21:06:00',
    istTimestamp: '2026-08-15 02:36:00',
    system: 'Storage (BlueVault)',
    sourceKey: 'bvk-7f3a (Attacker)',
    sourceIp: '198.18.7.24',
    endpointAction: 'list /',
    recordsVolume: 'Full Directory Tree',
    phase: 'Phase 4: Storage Recon',
    severity: 'high',
    findingDescription: 'Attacker weaponizes stolen storage key from TKT-48213 to enumerate confidential folders.',
    evidenceIds: ['E05'],
  },
  {
    id: 'EVT-17',
    utcTimestamp: '2026-08-14 21:16:00',
    istTimestamp: '2026-08-15 02:46:00',
    system: 'Storage (BlueVault)',
    sourceKey: 'bvk-7f3a (Attacker)',
    sourceIp: '198.18.7.23',
    endpointAction: 'read /finance/bank-instructions',
    recordsVolume: 'vendor-bank-details-2026.xlsx (3.46 MB)',
    phase: 'Phase 4: Master Bank Theft',
    severity: 'critical',
    findingDescription: 'Master vendor banking spreadsheet exfiltrated (bv-edb0081dad) along with payment run templates.',
    evidenceIds: ['E05'],
  },
  {
    id: 'EVT-18',
    utcTimestamp: '2026-08-16 04:35:00',
    istTimestamp: '2026-08-16 10:05:00',
    system: 'Identity / Admin',
    sourceKey: 'Attacker',
    sourceIp: '198.18.7.88',
    endpointAction: 'Sign-in against a.kapoor',
    recordsVolume: '3 Failed Login Attempts',
    phase: 'Admin Takeover Probe',
    severity: 'medium',
    findingDescription: 'Attacker attempts credential stuffing on security admin Aditi Kapoor; Aditi assumes a random bot.',
    evidenceIds: ['E13'],
  },
  {
    id: 'EVT-19',
    utcTimestamp: '2026-08-17 12:10:00',
    istTimestamp: '2026-08-17 17:40:00',
    system: 'Finance (LedgerOne)',
    sourceKey: 'tb-build-02 via key-tb-07',
    sourceIp: '10.20.4.77',
    endpointAction: '56x /v2/payments & bank-details',
    recordsVolume: '22.2 MB transferred in',
    phase: 'Phase 5: Rogue Host Infiltration',
    severity: 'critical',
    findingDescription: 'Vendor build server queries active payments and downloads payment export EXP-9955 over private link.',
    evidenceIds: ['E01', 'E15'],
  },
  {
    id: 'EVT-20',
    utcTimestamp: '2026-08-21 14:02:00',
    istTimestamp: '2026-08-21 19:32:00',
    system: 'Partner Email',
    sourceKey: 'TallyBridge Trust Team',
    sourceIp: 'Outside Vendor',
    endpointAction: 'Email to accounts@',
    recordsVolume: '1 Precaution Notice',
    phase: 'Misrouted Incident Warning',
    severity: 'medium',
    findingDescription: 'TallyBridge sends vague breach warning to billing email, omitting IT Security (Note 93).',
    evidenceIds: ['E12', 'E13'],
  },
  {
    id: 'EVT-21',
    utcTimestamp: '2026-08-24 14:05:00',
    istTimestamp: '2026-08-24 14:05:00',
    system: 'Billing / HelpDeskr',
    sourceKey: 'HelpDeskr Billing',
    sourceIp: 'billing@helpdeskr.example',
    endpointAction: 'Overage Notice Issued',
    recordsVolume: '₹22,500 Overage Surcharge',
    phase: 'Discovery Blindspot',
    severity: 'medium',
    findingDescription: 'HelpDeskr alerts customer to 13 bulk exports (4 legitimate + 9 overage). Madhavi Sundar treats it as accounting accrual (Note 91).',
    evidenceIds: ['E06', 'E13'],
  },
  {
    id: 'EVT-22',
    utcTimestamp: '2026-08-28 12:40:00',
    istTimestamp: '2026-08-28 18:10:00',
    system: 'Partner Email',
    sourceKey: 'TallyBridge Security',
    sourceIp: 'Outside Vendor',
    endpointAction: 'Notice to accounts & it-sec',
    recordsVolume: '1 Investigation Notice',
    phase: 'Vendor Cover-Up',
    severity: 'high',
    findingDescription: 'Vendor falsely claims finance systems and private link were unaffected; supplies defective IOCs (E17).',
    evidenceIds: ['E16', 'E17'],
  },
  {
    id: 'EVT-23',
    utcTimestamp: '2026-09-03 01:41:00',
    istTimestamp: '2026-09-03 07:11:00',
    system: 'Finance (LedgerOne)',
    sourceKey: 'key-tb-07',
    sourceIp: '10.20.4.77',
    endpointAction: 'GET /v2/vendors/V-0412 & scheduled',
    recordsVolume: 'Target Recon & Schedule',
    phase: 'Phase 6: Pre-Execution Target Recon',
    severity: 'high',
    findingDescription: 'Attacker inspects Coastal Packaging Ltd and confirms 14 upcoming scheduled payment disbursements.',
    evidenceIds: ['E18'],
  },
  {
    id: 'EVT-24',
    utcTimestamp: '2026-09-03 01:44:30',
    istTimestamp: '2026-09-03 07:14:30',
    system: 'Finance (LedgerOne / E19)',
    sourceKey: 'key-tb-07',
    sourceIp: '10.20.4.77',
    endpointAction: 'PATCH /v2/vendors/V-0412/bank-details',
    recordsVolume: '1 Bank Account Overwrite',
    phase: 'Phase 6: CLIMAX (BANK TAMPERING)',
    severity: 'critical',
    findingDescription: 'SMOKING GUN: Bank account for Coastal Packaging Ltd altered from ****4417 to ****9083 via API with NO approval ref (req-5f61b0de8, chg-8b9888c39b).',
    evidenceIds: ['E18', 'E19'],
  },
  {
    id: 'EVT-25',
    utcTimestamp: '2026-09-06 01:36:00',
    istTimestamp: '2026-09-06 07:06:00',
    system: 'Finance (LedgerOne)',
    sourceKey: 'key-tb-07',
    sourceIp: '10.20.4.77',
    endpointAction: 'GET /v2/payments/scheduled',
    recordsVolume: '15 Scheduled Disbursements',
    phase: 'Phase 7: Payment Lock-in Verification',
    severity: 'critical',
    findingDescription: 'Attacker confirms Coastal Packaging Ltd ₹2,48,000 disbursement is finalized to fraudulent account for Sep 8 release.',
    evidenceIds: ['E18'],
  },
  {
    id: 'EVT-26',
    utcTimestamp: '2026-09-07 08:30:00',
    istTimestamp: '2026-09-07 14:00:00',
    system: 'Executive / General Manager',
    sourceKey: 'Dev Raghavan (GM)',
    sourceIp: 'Harbor & Finch HQ',
    endpointAction: 'Engagement Commissioned',
    recordsVolume: 'Full Evidence Pack (E01-E20)',
    phase: 'Emergency Intervention',
    severity: 'critical',
    findingDescription: 'GM commissions emergency investigation to uncover facts and intercept fraudulent payment before disbursement tomorrow morning!',
    evidenceIds: ['E01', 'E20'],
  },
];

export interface CaseNoteRecord {
  noteId: string;
  department: string;
  raisedBy: string;
  date: string;
  reportedSymptom: string;
  provenGroundTruth: string;
  supportingEvidence: string[];
  status: 'Verified' | 'Action Required';
}

export const CASE_NOTES: CaseNoteRecord[] = [
  {
    noteId: 'Note 91',
    department: 'Finance',
    raisedBy: 'Madhavi Sundar (Finance Manager)',
    date: '24 Aug 2026',
    reportedSymptom: 'HelpDeskr billed us for export jobs we do not normally use. Support only needs one export a week. Need a line for month-end accrual.',
    provenGroundTruth: 'Attacker used tb-sync-svc to run 10 bulk exports (EXP-5410 to EXP-5419) on 11-12 August, exfiltrating the entire ticket database and generating ₹22,500 in overage billing. Support team saw the stuck job in chat (E13) and ignored it.',
    supportingEvidence: ['E02', 'E06', 'E13'],
    status: 'Verified',
  },
  {
    noteId: 'Note 92',
    department: 'Warehouse / IT Helpdesk',
    raisedBy: 'Prakash Menon (Helpdesk Technician)',
    date: '13 Aug 2026',
    reportedSymptom: 'Former employee login still works on the warehouse kiosk. We know he left in June.',
    provenGroundTruth: 'Former accounts payable clerk Rohan Menon exited 30 June 2026. HR marked his termination date but left status active (E14 proves all 8 exited employees remain active). On 13 Aug, r.menon signed in on kiosk dev-81546 without MFA (E03 sso-bb8ab61e08).',
    supportingEvidence: ['E03', 'E13', 'E14'],
    status: 'Verified',
  },
  {
    noteId: 'Note 93',
    department: 'Accounts Mailbox',
    raisedBy: 'Accounts Mailbox / Finance',
    date: '21 Aug 2026',
    reportedSymptom: 'A company we work with sent a notice about a "precaution". Nobody in IT received it, and we are not sure what it means for us.',
    provenGroundTruth: 'TallyBridge Trust Team emailed accounts@harborfinch.example describing a breach as a routine precaution. IT Security was omitted. Furthermore, the attacker had already extracted tickets, vendor databases, and bank files days earlier.',
    supportingEvidence: ['E12', 'E13', 'E16'],
    status: 'Verified',
  },
  {
    noteId: 'Note 94',
    department: 'Operations',
    raisedBy: 'Operations Manager',
    date: '03 Sep 2026',
    reportedSymptom: 'The dispatch dashboard was sluggish on some mornings in August. Probably nothing.',
    provenGroundTruth: 'Sluggishness was caused by massive multi-gigabyte export job creation and high-bandwidth database querying over the private link (10.20.4.77 transferred 22.2 MB in the early hours of 17, 18, and 19 August).',
    supportingEvidence: ['E01', 'E02', 'E15'],
    status: 'Verified',
  },
  {
    noteId: 'Note 95',
    department: 'Governance / Audit Committee',
    raisedBy: 'Audit Committee Chair',
    date: '01 Sep 2026',
    reportedSymptom: 'Inquired whether the issues from last year internal audit (IA-2025-09) were closed. Did not get a clear answer.',
    provenGroundTruth: 'Management closed zero technical audit findings. Unrotated integration keys (F4), unmonitored bulk exports (F6), orphan accounts (F3), and credential leaks (F2) all remained 100% open, directly enabling the compromise.',
    supportingEvidence: ['E09', 'E10', 'E11'],
    status: 'Verified',
  },
];

export interface HelpDeskrExportJob {
  jobId: string;
  createdTimeIst: string;
  createdTimeUtc: string;
  requester: string;
  callerIp: string;
  recordsCount: number;
  status: 'Completed' | 'Stuck on Delete' | 'Legitimate';
  type: 'Malicious Batch Export' | 'Weekly Service Review';
  deleted: boolean;
  notes: string;
}

export const EXPORT_JOBS_E02_E06: HelpDeskrExportJob[] = [
  {
    jobId: 'EXP-5408',
    createdTimeIst: '2026-08-04 09:12',
    createdTimeUtc: '2026-08-04 03:42',
    requester: 's.iyer (Sunita Iyer)',
    callerIp: '172.16.4.22',
    recordsCount: 4120,
    status: 'Legitimate',
    type: 'Weekly Service Review',
    deleted: false,
    notes: 'Regular Tuesday weekly service export',
  },
  {
    jobId: 'EXP-5409',
    createdTimeIst: '2026-08-11 09:15',
    createdTimeUtc: '2026-08-11 03:45',
    requester: 's.iyer (Sunita Iyer)',
    callerIp: '172.16.4.22',
    recordsCount: 4230,
    status: 'Legitimate',
    type: 'Weekly Service Review',
    deleted: false,
    notes: 'Regular Tuesday weekly service export',
  },
  {
    jobId: 'EXP-5410',
    createdTimeIst: '2026-08-11 23:30',
    createdTimeUtc: '2026-08-11 18:00',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.41',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'First unauthorized bulk extraction; downloaded entire ticket DB including TKT-48213',
  },
  {
    jobId: 'EXP-5411',
    createdTimeIst: '2026-08-11 23:38',
    createdTimeUtc: '2026-08-11 18:08',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.41',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'Exfiltrated attachments & customer configs',
  },
  {
    jobId: 'EXP-5412',
    createdTimeIst: '2026-08-11 23:42',
    createdTimeUtc: '2026-08-11 18:12',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.41',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'Bulk exfiltration pass 3',
  },
  {
    jobId: 'EXP-5413',
    createdTimeIst: '2026-08-11 23:45',
    createdTimeUtc: '2026-08-11 18:15',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.41',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'Bulk exfiltration pass 4',
  },
  {
    jobId: 'EXP-5414',
    createdTimeIst: '2026-08-11 23:48',
    createdTimeUtc: '2026-08-11 18:18',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.41',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'Bulk exfiltration pass 5',
  },
  {
    jobId: 'EXP-5415',
    createdTimeIst: '2026-08-11 23:51',
    createdTimeUtc: '2026-08-11 18:21',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.58',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'Attacker IP pivot to 198.18.7.58',
  },
  {
    jobId: 'EXP-5416',
    createdTimeIst: '2026-08-11 23:53',
    createdTimeUtc: '2026-08-11 18:23',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.58',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'Bulk exfiltration pass 7',
  },
  {
    jobId: 'EXP-5417',
    createdTimeIst: '2026-08-11 23:56',
    createdTimeUtc: '2026-08-11 18:26',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.58',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'Bulk exfiltration pass 8',
  },
  {
    jobId: 'EXP-5418',
    createdTimeIst: '2026-08-11 23:59',
    createdTimeUtc: '2026-08-11 18:29',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.58',
    recordsCount: 25390,
    status: 'Completed',
    type: 'Malicious Batch Export',
    deleted: true,
    notes: 'Bulk exfiltration pass 9',
  },
  {
    jobId: 'EXP-5419',
    createdTimeIst: '2026-08-12 00:33',
    createdTimeUtc: '2026-08-11 19:03',
    requester: 'tb-sync-svc',
    callerIp: '198.18.7.58',
    recordsCount: 25390,
    status: 'Stuck on Delete',
    type: 'Malicious Batch Export',
    deleted: false,
    notes: 'Anti-forensics delete timed out (evt-3fe76f60c4). Preserved proof in audit logs!',
  },
  {
    jobId: 'EXP-5420',
    createdTimeIst: '2026-08-18 09:20',
    createdTimeUtc: '2026-08-18 03:50',
    requester: 's.iyer (Sunita Iyer)',
    callerIp: '172.16.4.22',
    recordsCount: 4310,
    status: 'Legitimate',
    type: 'Weekly Service Review',
    deleted: false,
    notes: 'Regular Tuesday weekly service export',
  },
  {
    jobId: 'EXP-5421',
    createdTimeIst: '2026-08-25 09:14',
    createdTimeUtc: '2026-08-25 03:44',
    requester: 's.iyer (Sunita Iyer)',
    callerIp: '172.16.4.22',
    recordsCount: 4400,
    status: 'Legitimate',
    type: 'Weekly Service Review',
    deleted: false,
    notes: 'Regular Tuesday weekly service export',
  },
];

export interface ForensicApiLog {
  requestId: string;
  timestampUtc: string;
  callerIp: string;
  apiKeyId: string;
  userAgent: string;
  method: string;
  endpoint: string;
  recordsReturned: number;
  statusCode: number;
  phaseCategory: string;
  anomalyFlag: boolean;
  notes: string;
}

export const FORENSIC_API_LOGS: ForensicApiLog[] = [
  {
    requestId: 'req-6247db07f1',
    timestampUtc: '2026-07-22 06:10:14',
    callerIp: '172.16.8.31',
    apiKeyId: 'user:f.dsouza',
    userAgent: 'HF-Portal/5.2',
    method: 'POST',
    endpoint: '/v2/vendors/export',
    recordsReturned: 8800,
    statusCode: 200,
    phaseCategory: 'Legitimate Baseline',
    anomalyFlag: false,
    notes: 'Routine finance audit export by Senior Accountant',
  },
  {
    requestId: 'req-c28d87e49d',
    timestampUtc: '2026-08-09 03:12:44',
    callerIp: '198.18.7.41',
    apiKeyId: 'key-tb-07',
    userAgent: 'TallyBridge-Sync/3.4.1',
    method: 'GET',
    endpoint: '/v2/me',
    recordsReturned: 1,
    statusCode: 200,
    phaseCategory: 'Reconnaissance',
    anomalyFlag: true,
    notes: 'Token validity and permission probe from untrusted external IP',
  },
  {
    requestId: 'req-ac7784b06',
    timestampUtc: '2026-08-09 03:14:10',
    callerIp: '198.18.7.41',
    apiKeyId: 'key-tb-07',
    userAgent: 'TallyBridge-Sync/3.4.1',
    method: 'GET',
    endpoint: '/v2/schema',
    recordsReturned: 1,
    statusCode: 200,
    phaseCategory: 'Reconnaissance',
    anomalyFlag: true,
    notes: 'API schema and endpoint limits enumeration',
  },
  {
    requestId: 'req-c35c2ccaff',
    timestampUtc: '2026-08-12 03:41:22',
    callerIp: '198.18.7.41',
    apiKeyId: 'key-tb-07',
    userAgent: 'python-requests/2.31.0',
    method: 'POST',
    endpoint: '/v2/vendors/export',
    recordsReturned: 9840,
    statusCode: 200,
    phaseCategory: 'Exfiltration',
    anomalyFlag: true,
    notes: 'Generated vendor archive export 9931',
  },
  {
    requestId: 'req-d877f18b6c',
    timestampUtc: '2026-08-12 03:43:05',
    callerIp: '198.18.7.41',
    apiKeyId: 'key-tb-07',
    userAgent: 'python-requests/2.31.0',
    method: 'GET',
    endpoint: '/v2/exports/9931/download',
    recordsReturned: 9840,
    statusCode: 200,
    phaseCategory: 'Exfiltration',
    anomalyFlag: true,
    notes: 'Downloaded entire vendor master database',
  },
  {
    requestId: 'req-2cb75d3eac',
    timestampUtc: '2026-08-12 04:02:19',
    callerIp: '198.18.7.41',
    apiKeyId: 'key-tb-07',
    userAgent: 'python-requests/2.31.0',
    method: 'DELETE',
    endpoint: '/v2/exports/9931',
    recordsReturned: 0,
    statusCode: 204,
    phaseCategory: 'Anti-Forensics',
    anomalyFlag: true,
    notes: 'Deleted export job to evade detection',
  },
  {
    requestId: 'req-fe4bd4fe93',
    timestampUtc: '2026-08-18 12:45:11',
    callerIp: '10.20.4.77',
    apiKeyId: 'key-tb-07',
    userAgent: 'TallyBridge-Sync/3.5.0',
    method: 'POST',
    endpoint: '/v2/payments/export',
    recordsReturned: 4210,
    statusCode: 200,
    phaseCategory: 'Bank Probing (Rogue Host)',
    anomalyFlag: true,
    notes: 'Rogue build server tb-build-02 exports 4,210 pending payments',
  },
  {
    requestId: 'req-15a052a5e',
    timestampUtc: '2026-09-03 01:41:10',
    callerIp: '10.20.4.77',
    apiKeyId: 'key-tb-07',
    userAgent: 'TallyBridge-Sync/3.5.0',
    method: 'GET',
    endpoint: '/v2/vendors/V-0412',
    recordsReturned: 1,
    statusCode: 200,
    phaseCategory: 'Target Recon',
    anomalyFlag: true,
    notes: 'Attacker inspects Coastal Packaging Ltd',
  },
  {
    requestId: 'req-93d66fcd5',
    timestampUtc: '2026-09-03 01:41:50',
    callerIp: '10.20.4.77',
    apiKeyId: 'key-tb-07',
    userAgent: 'TallyBridge-Sync/3.5.0',
    method: 'GET',
    endpoint: '/v2/vendors/V-0412/bank-details',
    recordsReturned: 1,
    statusCode: 200,
    phaseCategory: 'Target Recon',
    anomalyFlag: true,
    notes: 'Inspects current bank account ****4417',
  },
  {
    requestId: 'req-33a3928eca',
    timestampUtc: '2026-09-03 01:42:45',
    callerIp: '10.20.4.77',
    apiKeyId: 'key-tb-07',
    userAgent: 'TallyBridge-Sync/3.5.0',
    method: 'GET',
    endpoint: '/v2/payments/scheduled',
    recordsReturned: 14,
    statusCode: 200,
    phaseCategory: 'Target Recon',
    anomalyFlag: true,
    notes: 'Verifies scheduled payout for Sep 8 payment run',
  },
  {
    requestId: 'req-5f61b0de8',
    timestampUtc: '2026-09-03 01:44:30',
    callerIp: '10.20.4.77',
    apiKeyId: 'key-tb-07',
    userAgent: 'TallyBridge-Sync/3.5.0',
    method: 'PATCH',
    endpoint: '/v2/vendors/V-0412/bank-details',
    recordsReturned: 1,
    statusCode: 200,
    phaseCategory: 'FRAUD EXECUTION',
    anomalyFlag: true,
    notes: 'THE CLIMAX: Bank account overwritten to ****9083 via API without approval ref',
  },
  {
    requestId: 'req-bb819dfe0c',
    timestampUtc: '2026-09-06 01:36:05',
    callerIp: '10.20.4.77',
    apiKeyId: 'key-tb-07',
    userAgent: 'TallyBridge-Sync/3.5.0',
    method: 'GET',
    endpoint: '/v2/payments/scheduled',
    recordsReturned: 15,
    statusCode: 200,
    phaseCategory: 'Verification',
    anomalyFlag: true,
    notes: 'Attacker confirms tampered account locked into Sep 8 payment batch',
  },
];

export interface BlueVaultAccessLog {
  eventId: string;
  epochSeconds: number;
  normalizedUtc: string;
  callerIp: string;
  keyId: string;
  action: string;
  path: string;
  bytesTransferred: number;
  notes: string;
}

export const BLUEVAULT_ACCESS_LOGS: BlueVaultAccessLog[] = [
  {
    eventId: 'bv-018f4a21',
    epochSeconds: 1786827960,
    normalizedUtc: '2026-08-14 21:06:00',
    callerIp: '198.18.7.24',
    keyId: 'bvk-7f3a',
    action: 'LIST',
    path: '/',
    bytesTransferred: 4096,
    notes: 'Storage root enumeration with key stolen from ticket TKT-48213',
  },
  {
    eventId: 'bv-edb0081dad',
    epochSeconds: 1786828560,
    normalizedUtc: '2026-08-14 21:16:00',
    callerIp: '198.18.7.23',
    keyId: 'bvk-7f3a',
    action: 'READ',
    path: '/finance/bank-instructions/vendor-bank-details-2026.xlsx',
    bytesTransferred: 3628400,
    notes: '3.46 MB master vendor bank details spreadsheet exfiltrated',
  },
  {
    eventId: 'bv-94baddc5d7',
    epochSeconds: 1786829460,
    normalizedUtc: '2026-08-14 21:31:00',
    callerIp: '198.18.7.24',
    keyId: 'bvk-7f3a',
    action: 'READ',
    path: '/finance/bank-instructions/payment-run-template.xlsx',
    bytesTransferred: 1174405,
    notes: 'Payment disbursement template downloaded',
  },
  {
    eventId: 'bv-8841a12001',
    epochSeconds: 1786914600,
    normalizedUtc: '2026-08-15 21:10:00',
    callerIp: '198.18.7.77',
    keyId: 'bvk-7f3a',
    action: 'READ',
    path: '/finance/statements/stmt-2026-01.pdf',
    bytesTransferred: 2450000,
    notes: 'Monthly bank statement harvested',
  },
  {
    eventId: 'bv-8841a12005',
    epochSeconds: 1786915200,
    normalizedUtc: '2026-08-15 21:20:00',
    callerIp: '198.18.7.77',
    keyId: 'bvk-7f3a',
    action: 'READ',
    path: '/finance/statements/stmt-2026-05.pdf',
    bytesTransferred: 2680000,
    notes: 'Latest quarterly bank statement harvested',
  },
];

export interface TerminatedActiveEmployee {
  empId: string;
  name: string;
  department: string;
  role: string;
  hireDate: string;
  terminationDate: string;
  rosterStatus: string;
  ssoStatus: string;
  lastLogin: string;
  anomalyFlag: boolean;
  notes: string;
}

export const TERMINATED_ACTIVE_EMPLOYEES: TerminatedActiveEmployee[] = [
  {
    empId: 'HF0004',
    name: 'Rohan Menon',
    department: 'Finance',
    role: 'Former Accounts Payable Clerk',
    hireDate: '2023-01-15',
    terminationDate: '2026-06-30',
    rosterStatus: 'active (VULNERABLE)',
    ssoStatus: 'Enabled (Orphaned)',
    lastLogin: '2026-08-13 09:02 UTC (dev-81546 kiosk)',
    anomalyFlag: true,
    notes: 'Logged into warehouse office terminal dev-81546 without MFA on 13 Aug (Note 92 / E03)',
  },
  {
    empId: 'HF0039',
    name: 'Sneha Reddy',
    department: 'Operations',
    role: 'Dispatch Coordinator',
    hireDate: '2023-08-10',
    terminationDate: '2026-02-28',
    rosterStatus: 'active (VULNERABLE)',
    ssoStatus: 'Enabled (Orphaned)',
    lastLogin: '2026-03-01 10:15 UTC',
    anomalyFlag: true,
    notes: 'Exited 5 months prior, account never deactivated',
  },
  {
    empId: 'HF0082',
    name: 'Suresh Nair',
    department: 'Warehouse',
    role: 'Inventory Supervisor',
    hireDate: '2022-11-01',
    terminationDate: '2026-03-31',
    rosterStatus: 'active (VULNERABLE)',
    ssoStatus: 'Enabled (Orphaned)',
    lastLogin: '2026-04-02 08:30 UTC',
    anomalyFlag: true,
    notes: 'Orphaned credentials intact in SSO',
  },
  {
    empId: 'HF0114',
    name: 'Kavita Mehta',
    department: 'Support',
    role: 'Support Representative',
    hireDate: '2024-02-15',
    terminationDate: '2026-04-15',
    rosterStatus: 'active (VULNERABLE)',
    ssoStatus: 'Enabled (Orphaned)',
    lastLogin: '2026-04-16 11:20 UTC',
    anomalyFlag: true,
    notes: 'Orphaned credentials intact in SSO',
  },
  {
    empId: 'HF0167',
    name: 'Debashis Das',
    department: 'Operations',
    role: 'Route Planner',
    hireDate: '2023-05-20',
    terminationDate: '2026-05-15',
    rosterStatus: 'active (VULNERABLE)',
    ssoStatus: 'Enabled (Orphaned)',
    lastLogin: '2026-05-18 09:00 UTC',
    anomalyFlag: true,
    notes: 'Orphaned credentials intact in SSO',
  },
  {
    empId: 'HF0229',
    name: 'Mustafa Sheikh',
    department: 'Finance',
    role: 'Billing Specialist',
    hireDate: '2024-01-10',
    terminationDate: '2026-05-31',
    rosterStatus: 'active (VULNERABLE)',
    ssoStatus: 'Enabled (Orphaned)',
    lastLogin: '2026-06-01 14:10 UTC',
    anomalyFlag: true,
    notes: 'Orphaned credentials intact in SSO',
  },
  {
    empId: 'HF0302',
    name: 'Rajesh Joshi',
    department: 'Warehouse',
    role: 'Dock Operator',
    hireDate: '2023-09-01',
    terminationDate: '2026-06-15',
    rosterStatus: 'active (VULNERABLE)',
    ssoStatus: 'Enabled (Orphaned)',
    lastLogin: '2026-06-16 07:45 UTC',
    anomalyFlag: true,
    notes: 'Orphaned credentials intact in SSO',
  },
  {
    empId: 'HF0395',
    name: 'Tarun Raman',
    department: 'IT',
    role: 'Junior Systems Admin',
    hireDate: '2024-04-01',
    terminationDate: '2026-06-30',
    rosterStatus: 'active (VULNERABLE)',
    ssoStatus: 'Enabled (Orphaned)',
    lastLogin: '2026-07-02 16:00 UTC',
    anomalyFlag: true,
    notes: 'Orphaned credentials intact in SSO',
  },
];

// ==========================================
// OFFENSIVE ATTACK SIMULATION DATA MODELS
// ==========================================

export interface OffensiveAttackVector {
  id: string;
  name: string;
  category: 'Token Discovery' | 'Bulk Exfiltration' | 'Tunnel Pivot' | 'Financial Hijack';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  targetSystem: string;
  endpoint: string;
  httpMethod: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  exploitedKey: string;
  sourceHost: string;
  executionTimestamp: string;
  payloadSummary: string;
  rawPayload: Record<string, unknown> | string;
  simulatedCurlCommand: string;
  targetVulnerability: string;
  footprintRecordId: string;
  evidenceRef: string;
  financialImpact?: string;
  evasionStrategy: string;
}

export const OFFENSIVE_ATTACK_VECTORS: OffensiveAttackVector[] = [
  {
    id: 'VEC-01',
    name: 'Stealth Vendor Bank Account Tampering (Financial Redirection)',
    category: 'Financial Hijack',
    severity: 'CRITICAL',
    targetSystem: 'LedgerOne (Finance API)',
    endpoint: '/api/v2/vendors/V-0412/bank-details',
    httpMethod: 'PATCH',
    exploitedKey: 'key-tb-07',
    sourceHost: '10.20.4.77 (tb-build-02 via Private Link)',
    executionTimestamp: '2026-09-03 01:44:30 UTC',
    payloadSummary: 'Altered Coastal Packaging Ltd account to ****9083 with blank approval reference right before Sep 8 disbursement.',
    rawPayload: {
      vendor_id: 'V-0412',
      bank_name: 'Apex Merchant Bank',
      account_number: '••••••••9083',
      ifsc_code: 'APEX0004918',
      approval_reference: '',
      change_reason: 'Automated nightly sync update',
    },
    simulatedCurlCommand: 'curl -X PATCH "https://ledgerone.harborfinch.internal/api/v2/vendors/V-0412/bank-details" \\\n  -H "X-Api-Key: key-tb-07" \\\n  -H "User-Agent: TallyBridge-Sync/3.5.0" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"account_number":"9083","approval_reference":""}\'',
    targetVulnerability: 'Zero validation on bank account changes; API allows blank approval reference without dual-authorization controls.',
    footprintRecordId: 'req-5f61b0de8 · chg-8b9888c39b',
    evidenceRef: 'E18, E19',
    financialImpact: '₹2,48,000 disbursement queued for diversion on 08 Sep 2026',
    evasionStrategy: 'Executed inside legitimate 01:00-02:30 UTC nightly sync window using authentic User-Agent TallyBridge-Sync/3.5.0.',
  },
  {
    id: 'VEC-02',
    name: 'Unconstrained Bulk Support Data Harvest (HelpDeskr Exfiltration)',
    category: 'Bulk Exfiltration',
    severity: 'HIGH',
    targetSystem: 'HelpDeskr (Support SaaS)',
    endpoint: '/api/v1/exports',
    httpMethod: 'POST',
    exploitedKey: 'tb-sync-svc',
    sourceHost: '198.18.7.41 / 198.18.7.58 (Untrusted External Ranges)',
    executionTimestamp: '2026-08-11 23:30 to 2026-08-12 00:29 IST',
    payloadSummary: 'Generated 10 bulk ticket export jobs (EXP-5410 to EXP-5419) harvesting tickets, customer secrets, and pasted credentials.',
    rawPayload: {
      export_type: 'tickets_full_history',
      format: 'csv_compressed',
      include_attachments: true,
      include_internal_notes: true,
    },
    simulatedCurlCommand: 'curl -X POST "https://api.helpdeskr.io/v1/exports" \\\n  -H "Authorization: Bearer tb-sync-svc" \\\n  -H "User-Agent: python-requests/2.31.0" \\\n  -H "Content-Type: application/json" \\\n  -d \'{"export_type":"tickets_full_history","include_internal_notes":true}\'',
    targetVulnerability: 'tb-sync-svc has infinite token lifetime and unrestricted admin export scope without rate limiting or IP binding.',
    footprintRecordId: 'EXP-5419 (evt-3fe76f60c4 stuck delete timeout)',
    evidenceRef: 'E02, E06, E13',
    financialImpact: '₹22,500 billing surcharge from 9 excess jobs billed on INV-HD-2026-0831',
    evasionStrategy: 'Attempted export.delete immediately after download; EXP-5419 timed out, preserving permanent evidence.',
  },
  {
    id: 'VEC-03',
    name: 'Storage Vault Credential Abuse & Financial Manifest Harvest',
    category: 'Bulk Exfiltration',
    severity: 'HIGH',
    targetSystem: 'BlueVault (Document Storage)',
    endpoint: '/files/Finance/Bank Instructions/vendor-bank-details-2026.xlsx',
    httpMethod: 'GET',
    exploitedKey: 'bvk-7f3a (harvested from ticket TKT-48213 leak)',
    sourceHost: '198.18.7.23 / 198.18.7.24',
    executionTimestamp: '2026-08-14 21:16 to 21:31 UTC',
    payloadSummary: 'Exfiltrated master vendor bank details (3.46 MB) and 13 monthly financial statements to identify highest value payment target.',
    rawPayload: {
      file_path: 'Finance/Bank Instructions/vendor-bank-details-2026.xlsx',
      token: 'bvk-7f3a',
    },
    simulatedCurlCommand: 'curl -X GET "https://bluevault.harborfinch.internal/files/Finance/Bank%20Instructions/vendor-bank-details-2026.xlsx" \\\n  -H "X-Vault-Key: bvk-7f3a" \\\n  -o "vendor-bank-details-2026.xlsx"',
    targetVulnerability: 'Key bvk-7f3a leaked in plain text in support ticket notes; BlueVault has zero IP whitelisting.',
    footprintRecordId: 'bv-edb0081dad (3,627,910 bytes)',
    evidenceRef: 'E05, E13',
    financialImpact: 'Exfiltrated complete banking topology for 300+ freight vendors',
    evasionStrategy: 'Relies on BlueVault hardware clock drift (+14 minutes skew) to disrupt automated SIEM correlation.',
  },
  {
    id: 'VEC-04',
    name: 'Private Link Tunnel Pivot via Rogue Build Runner',
    category: 'Tunnel Pivot',
    severity: 'HIGH',
    targetSystem: 'Vendor Private Link (10.20.4.0/24)',
    endpoint: 'TCP / 443 (Direct API Gateway)',
    httpMethod: 'POST',
    exploitedKey: 'key-tb-07',
    sourceHost: '10.20.4.77 (tb-build-02)',
    executionTimestamp: '2026-08-17 to 2026-08-19 12:10 UTC',
    payloadSummary: 'Pivoted through unauthenticated CI/CD runner host 10.20.4.77 over the dedicated vendor tunnel, transferring 22.2 MB.',
    rawPayload: {
      source_ip: '10.20.4.77',
      dest_ip: '172.16.20.5',
      port: 443,
      bytes_transferred: 22200000,
    },
    simulatedCurlCommand: 'ssh -N -L 8443:172.16.20.5:443 runner@10.20.4.77 \\\n  && curl -k -X POST "https://localhost:8443/api/v2/queries" -H "X-Api-Key: key-tb-07"',
    targetVulnerability: 'Harbor & Finch implicitly trusts all traffic arriving from subnet 10.20.4.0/24 without host identity validation.',
    footprintRecordId: 'Flow Log 9.8k rows · 22.2 MB volume',
    evidenceRef: 'E15',
    financialImpact: 'Reconnaissance mapped all 300 vendors, payment dates (8th & 23rd), and selected V-0412 as prime target',
    evasionStrategy: 'Masqueraded within ordinary CI/CD automated pipeline traffic.',
  },
];

export interface AttackFootprintLog {
  id: string;
  sourceSystem: string;
  systemClock: string;
  recordIdentifier: string;
  httpDetails: string;
  actorIdentity: string;
  callerIp: string;
  recordsOrBytes: string;
  status: string;
  verifiedInEvidence: string;
  evasionTrait: string;
}

export const ATTACK_FOOTPRINT_VERIFICATION: AttackFootprintLog[] = [
  {
    id: 'FP-01',
    sourceSystem: 'LedgerOne API Log',
    systemClock: 'UTC',
    recordIdentifier: 'req-5f61b0de8',
    httpDetails: 'PATCH /api/v2/vendors/V-0412/bank-details',
    actorIdentity: 'key-tb-07',
    callerIp: '10.20.4.77 (tb-build-02)',
    recordsOrBytes: '1 record altered',
    status: '200 OK',
    verifiedInEvidence: 'E18 / E19 (chg-8b9888c39b)',
    evasionTrait: 'Executed during regular nightly sync window; User-Agent spoofed as TallyBridge-Sync/3.5.0.',
  },
  {
    id: 'FP-02',
    sourceSystem: 'LedgerOne API Log',
    systemClock: 'UTC',
    recordIdentifier: 'req-c35c2ccaff',
    httpDetails: 'POST /api/v2/exports (export 9931)',
    actorIdentity: 'key-tb-07',
    callerIp: '198.18.7.41 (External Untrusted)',
    recordsOrBytes: '9,840 records',
    status: '201 Created',
    verifiedInEvidence: 'E01',
    evasionTrait: 'Followed by req-2cb75d3eac (DELETE export 9931) to wipe audit footprint from export queue.',
  },
  {
    id: 'FP-03',
    sourceSystem: 'HelpDeskr Audit Log',
    systemClock: 'IST (UTC+5:30)',
    recordIdentifier: 'EXP-5419 (evt-3fe76f60c4)',
    httpDetails: 'POST /api/v1/exports',
    actorIdentity: 'tb-sync-svc',
    callerIp: '198.18.7.58 (External Untrusted)',
    recordsOrBytes: '2,500 tickets + attachments',
    status: '200 OK (Delete timed out)',
    verifiedInEvidence: 'E02 / E06',
    evasionTrait: 'export.delete triggered immediately; timed out after 30s, creating permanent audit trace.',
  },
  {
    id: 'FP-04',
    sourceSystem: 'BlueVault Access Log',
    systemClock: 'Unix Epoch (+14m drift)',
    recordIdentifier: 'bv-edb0081dad',
    httpDetails: 'GET /Finance/Bank Instructions/vendor-bank-details-2026.xlsx',
    actorIdentity: 'bvk-7f3a',
    callerIp: '198.18.7.23 (External)',
    recordsOrBytes: '3,627,910 bytes (3.46 MB)',
    status: '200 Success',
    verifiedInEvidence: 'E05',
    evasionTrait: 'Hardware epoch drift distorts timeline correlation against UTC firewall logs.',
  },
  {
    id: 'FP-05',
    sourceSystem: 'Private Link Flow Log',
    systemClock: 'UTC',
    recordIdentifier: 'flow-seq-8812',
    httpDetails: 'TCP SYN/ACK 10.20.4.77:48912 -> 172.16.20.5:443',
    actorIdentity: 'tb-build-02 host tunnel',
    callerIp: '10.20.4.77 (Private Link)',
    recordsOrBytes: '22.2 MB cumulative payload',
    status: 'ESTABLISHED',
    verifiedInEvidence: 'E15',
    evasionTrait: 'Leveraged dedicated vendor subnet 10.20.4.0/24 where perimeter inspections were disabled.',
  },
];

export interface OffensiveKillChainPhase {
  phaseNumber: number;
  phaseName: string;
  timeWindow: string;
  tacticalObjective: string;
  keyAction: string;
  toolsUsed: string;
  outcome: string;
  detectionStatus: 'Undetected' | 'Overage Notice' | 'Stuck Delete Artifact';
}

export const OFFENSIVE_KILLCHAIN_PHASES: OffensiveKillChainPhase[] = [
  {
    phaseNumber: 1,
    phaseName: 'Reconnaissance & Token Harvesting',
    timeWindow: '25 Jun – 09 Aug 2026',
    tacticalObjective: 'Discover valid machine credentials and inspect schema without triggering threshold alerts.',
    keyAction: 'Harvested storage key bvk-7f3a from leaked ticket TKT-48213; probed LedgerOne /v2/me with key-tb-07.',
    toolsUsed: 'CURL / Custom Python Client, User-Agent: HF-Portal/5.2',
    outcome: 'Acquired bvk-7f3a and validated key-tb-07 full read/write admin scope.',
    detectionStatus: 'Undetected',
  },
  {
    phaseNumber: 2,
    phaseName: 'Mass Data Exfiltration & Target Selection',
    timeWindow: '11 Aug – 16 Aug 2026',
    tacticalObjective: 'Extract full vendor database and payment instructions to identify highest payout vendor.',
    keyAction: 'Created 10 HelpDeskr exports (EXP-5410-5419) and downloaded vendor-bank-details-2026.xlsx from BlueVault.',
    toolsUsed: 'API Automated Worker, tb-sync-svc & bvk-7f3a',
    outcome: 'Target selected: Coastal Packaging Ltd (V-0412), scheduled for ₹2,48,000 on 08 Sep.',
    detectionStatus: 'Overage Notice',
  },
  {
    phaseNumber: 3,
    phaseName: 'Lateral Network Infiltration & Tunnel Pivot',
    timeWindow: '17 Aug – 19 Aug 2026',
    tacticalObjective: 'Establish trusted internal IP presence to bypass external perimeter logging.',
    keyAction: 'Pivoted through rogue CI/CD runner 10.20.4.77 over Private Link tunnel 10.20.4.0/24.',
    toolsUsed: 'TallyBridge build runner tb-build-02, User-Agent: TallyBridge-Sync/3.5.0',
    outcome: 'Conducted 56 targeted queries into payment schedules and vendor master tables.',
    detectionStatus: 'Undetected',
  },
  {
    phaseNumber: 4,
    phaseName: 'Weaponized Payload Delivery (Bank Hijack)',
    timeWindow: '03 Sep 2026 01:44:30 UTC',
    tacticalObjective: 'Silently reroute disbursement funds to adversary account without human authorization.',
    keyAction: 'Patched V-0412 bank account to ****9083 via PATCH /api/v2/vendors/V-0412/bank-details with empty approval_reference.',
    toolsUsed: 'key-tb-07 from 10.20.4.77 (req-5f61b0de8)',
    outcome: 'Bank details successfully modified (chg-8b9888c39b). Payout primed for 08 Sep disbursement run.',
    detectionStatus: 'Undetected',
  },
];
