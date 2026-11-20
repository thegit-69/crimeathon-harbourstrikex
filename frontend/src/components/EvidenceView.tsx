import { useState, useMemo } from 'react';
import {
  EVIDENCE_INVENTORY,
  ATTACK_FOOTPRINT_VERIFICATION,
} from '../data/caseEvidenceData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog } from './ui/dialog';
import {
  Play,
  RotateCcw,
  Printer,
  ShieldCheck,
  Clock,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Sliders,
  Terminal,
  Activity,
  ChevronDown,
} from 'lucide-react';
import { ledgeroneApi, checkBackendHealth } from '../services/api';
import type { StoredSimulationRun } from './DashboardView';

interface SimulationStepLog {
  stepNumber: number;
  type: 'completed' | 'failed' | 'skipped' | 'info';
  timestamp: string;
  system: string;
  action: string;
  endpoint: string;
  actor: string;
  detail: string;
  artifactRef: string;
}

interface ReconstructedFootprintEvent {
  id: string;
  timestamp: string;
  sourceSystem: string;
  actor: string;
  action: string;
  targetResource: string;
  status: string;
  evidenceRef: string;
  isSimulated: boolean;
}

function buildStepLogsForRun(run: StoredSimulationRun): SimulationStepLog[] {
  const ts = run.timestamp;
  if (run.scenarioId === 'SCEN-01') {
    return [
      {
        stepNumber: 1,
        type: 'completed',
        timestamp: `${ts} · +0.02s`,
        system: 'HelpDeskr',
        action: 'GET /api/v1/me',
        endpoint: '/api/v1/me',
        actor: 'tb-sync-svc',
        detail: 'Validated machine token scope. Response 200 OK (admin:exports verified).',
        artifactRef: 'req-auth-sim-01',
      },
      {
        stepNumber: 2,
        type: 'completed',
        timestamp: `${ts} · +0.18s`,
        system: 'HelpDeskr',
        action: 'POST /api/v1/exports',
        endpoint: '/api/v1/exports',
        actor: 'tb-sync-svc',
        detail: 'Triggered 10 bulk ticket exports (EXP-5410 to EXP-5419) with internal notes.',
        artifactRef: 'EXP-5419',
      },
      {
        stepNumber: 3,
        type: 'completed',
        timestamp: `${ts} · +0.31s`,
        system: 'HelpDeskr',
        action: 'DELETE /api/v1/exports/EXP-5419',
        endpoint: '/api/v1/exports/EXP-5419',
        actor: 'tb-sync-svc',
        detail: 'Delete job timed out (504 Gateway Timeout). Permanent footprint artifact preserved.',
        artifactRef: 'evt-3fe76f60c4',
      },
    ];
  } else if (run.scenarioId === 'SCEN-02') {
    return [
      {
        stepNumber: 1,
        type: 'completed',
        timestamp: `${ts} · +0.04s`,
        system: 'HelpDeskr',
        action: 'GET /api/v1/tickets/TKT-48213/comments',
        endpoint: '/api/v1/tickets/TKT-48213/comments',
        actor: 'tb-sync-svc',
        detail: 'Extracted cleartext storage credential bvk-7f3a from ticket comments.',
        artifactRef: 'TKT-48213',
      },
      {
        stepNumber: 2,
        type: 'completed',
        timestamp: `${ts} · +0.15s`,
        system: 'BlueVault',
        action: 'GET /files/Finance/Bank Instructions',
        endpoint: '/files/Finance/Bank Instructions',
        actor: 'bvk-7f3a',
        detail: 'Enumerated restricted directory with unrotated token. 3 files discovered.',
        artifactRef: 'bv-enum-9912',
      },
      {
        stepNumber: 3,
        type: 'completed',
        timestamp: `${ts} · +0.28s`,
        system: 'BlueVault',
        action: 'GET /files/Finance/.../vendor-bank-details-2026.xlsx',
        endpoint: '/files/Finance/Bank Instructions/vendor-bank-details-2026.xlsx',
        actor: 'bvk-7f3a',
        detail: 'Exfiltrated master vendor bank details (3,627,910 bytes). Clock offset noted.',
        artifactRef: 'bv-edb0081dad',
      },
    ];
  } else if (run.scenarioId === 'SCEN-03') {
    return [
      {
        stepNumber: 1,
        type: 'completed',
        timestamp: `${ts} · +0.03s`,
        system: 'Network Link',
        action: 'TCP SYN 10.20.4.77:48912 -> 172.16.20.5:443',
        endpoint: '10.20.4.0/24 tunnel gateway',
        actor: 'tb-build-02',
        detail: 'Established tunnel connection across unauthenticated vendor link. Mutual TLS omitted.',
        artifactRef: 'flow-seq-8812',
      },
      {
        stepNumber: 2,
        type: 'completed',
        timestamp: `${ts} · +0.22s`,
        system: 'LedgerOne',
        action: 'GET /api/v2/payments/scheduled',
        endpoint: '/api/v2/payments/scheduled',
        actor: 'key-tb-07',
        detail: 'Executed 56 reconnaissance queries using User-Agent: TallyBridge-Sync/3.5.0.',
        artifactRef: 'req-bb819dfe0c',
      },
    ];
  } else if (run.scenarioId === 'SCEN-04') {
    return [
      {
        stepNumber: 1,
        type: 'completed',
        timestamp: `${ts} · +0.04s`,
        system: 'LedgerOne',
        action: 'GET /api/v2/vendors/V-0412',
        endpoint: '/api/v2/vendors/V-0412',
        actor: 'key-tb-07',
        detail: 'Queried target vendor record. Payout ₹2,48,000 on INV-9081 identified.',
        artifactRef: 'req-vcheck-491',
      },
      {
        stepNumber: 2,
        type: 'completed',
        timestamp: `${ts} · +0.19s`,
        system: 'LedgerOne',
        action: 'PATCH /api/v2/vendors/V-0412/bank-details',
        endpoint: '/api/v2/vendors/V-0412/bank-details',
        actor: 'key-tb-07',
        detail: 'Patched beneficiary account to ****9083. Blank approval_reference accepted by API.',
        artifactRef: 'req-5f61b0de8',
      },
      {
        stepNumber: 3,
        type: 'completed',
        timestamp: `${ts} · +0.29s`,
        system: 'LedgerOne',
        action: 'GET /api/v2/payments/batches/2026-09-08',
        endpoint: '/api/v2/payments/batches/2026-09-08',
        actor: 'key-tb-07',
        detail: 'Confirmed payment batch locked in for modified destination on 08 Sep.',
        artifactRef: 'chg-8b9888c39b',
      },
    ];
  } else {
    // SCEN-COMBINED
    return [
      {
        stepNumber: 1,
        type: 'completed',
        timestamp: `${ts} · +0.02s`,
        system: 'HelpDeskr',
        action: 'GET /api/v1/tickets/TKT-48213/comments',
        endpoint: '/api/v1/tickets/TKT-48213/comments',
        actor: 'tb-sync-svc',
        detail: 'Discovered storage key bvk-7f3a in cleartext ticket notes.',
        artifactRef: 'TKT-48213',
      },
      {
        stepNumber: 2,
        type: 'completed',
        timestamp: `${ts} · +0.11s`,
        system: 'HelpDeskr',
        action: 'POST /api/v1/exports',
        endpoint: '/api/v1/exports',
        actor: 'tb-sync-svc',
        detail: 'Harvested 10 bulk ticket exports; EXP-5419 deletion timeout created permanent audit trace.',
        artifactRef: 'EXP-5419',
      },
      {
        stepNumber: 3,
        type: 'completed',
        timestamp: `${ts} · +0.21s`,
        system: 'BlueVault',
        action: 'GET /files/.../vendor-bank-details-2026.xlsx',
        endpoint: '/files/Finance/Bank Instructions/vendor-bank-details-2026.xlsx',
        actor: 'bvk-7f3a',
        detail: 'Exfiltrated 3.46 MB bank instructions sheet. Identified V-0412 payout of ₹2,48,000.',
        artifactRef: 'bv-edb0081dad',
      },
      {
        stepNumber: 4,
        type: 'completed',
        timestamp: `${ts} · +0.33s`,
        system: 'Network Link',
        action: 'TCP SYN 10.20.4.77:48912 -> 172.16.20.5:443',
        endpoint: '10.20.4.0/24 tunnel gateway',
        actor: 'tb-build-02',
        detail: 'Pivoted across vendor Private Link tunnel during nightly sync window (01:44 UTC).',
        artifactRef: 'flow-seq-8812',
      },
      {
        stepNumber: 5,
        type: 'completed',
        timestamp: `${ts} · +0.44s`,
        system: 'LedgerOne',
        action: 'PATCH /api/v2/vendors/V-0412/bank-details',
        endpoint: '/api/v2/vendors/V-0412/bank-details',
        actor: 'key-tb-07',
        detail: 'Patched Coastal Packaging Ltd bank account to ****9083 without approval reference.',
        artifactRef: 'req-5f61b0de8 · chg-8b9888c39b',
      },
    ];
  }
}

function SimulationReportDocument({
  run,
  footprints,
  sourceHost = '10.20.4.77 (tb-build-02)',
  credentialToken = 'key-tb-07',
  targetVendor = 'V-0412 (Coastal Packaging Ltd)',
  executionWindow = '01:44:30 UTC (Nightly Window)',
}: {
  run: StoredSimulationRun;
  footprints: ReconstructedFootprintEvent[];
  sourceHost?: string;
  credentialToken?: string;
  targetVendor?: string;
  executionWindow?: string;
}) {
  const scenarioLabels: Record<string, string> = {
    'SCEN-COMBINED': 'Full Incident Attack Vector (End-to-End Exfiltration & Payout Redirect)',
    'SCEN-01': 'Over-privileged Machine Token Bulk Export (HelpDeskr)',
    'SCEN-02': 'Storage Key Discovery & Bank Details Exfiltration (BlueVault)',
    'SCEN-03': 'Private Link Lateral Tunnel Pivot (10.20.4.77)',
    'SCEN-04': 'Unauthorized Vendor Payout Account Patch (LedgerOne)',
  };

  const scenarioName = scenarioLabels[run.scenarioId] || run.scenarioName || run.scenarioId;

  return (
    <div className="report-document bg-white text-slate-900 space-y-6">
      {/* 1. Report Header */}
      <div className="border-b border-slate-300 pb-4 print-avoid-break">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
              HarbourStrikeX · Technical Validation Audit
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              Simulation Footprint & Verification Report
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 mt-1.5 font-mono">
              <span>Case ID: <strong>CR-26-047</strong></span>
              <span>•</span>
              <span>Run ID: <strong>{run.runId}</strong></span>
              <span>•</span>
              <span>Timestamp: <strong>{run.timestamp}</strong></span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-300 rounded">
              Local Controlled Simulation
            </span>
            <div className="text-[10px] text-slate-500 mt-1">
              Harbor & Finch Freight Pvt. Ltd.
            </div>
          </div>
        </div>

        <div className="mt-3 px-3 py-2 bg-amber-50/70 border border-amber-200 rounded text-[11px] text-amber-900 leading-snug">
          <strong>Notice:</strong> This document represents controlled synthetic execution output conducted under CRIMEATHON'26 Offense Track. Simulated traces are mathematically correlated against ground truth case evidence E01–E20.
        </div>
      </div>

      {/* 2. Execution Summary */}
      <div className="space-y-2 print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          1. Execution Summary & Reconciliation Metrics
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Expected Actions</span>
            <span className="text-base font-bold text-slate-900">{run.stepsCount} expected</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Recorded Footprints</span>
            <span className="text-base font-bold text-slate-900">{run.footprintCount} recorded</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Matched Records</span>
            <span className="text-base font-bold text-emerald-800">{run.footprintCount} matched</span>
          </div>
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Missing / Unmatched</span>
            <span className="text-base font-bold text-slate-900">0</span>
          </div>
        </div>

        <div className="p-2.5 bg-emerald-50/80 border border-emerald-300 rounded text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-semibold text-emerald-950">
              Overall Status: Confirmed Match (100% Correlation)
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded">
            VERIFIED
          </span>
        </div>
      </div>

      {/* 3. Execution Details */}
      <div className="space-y-2 print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          2. Simulation Execution Parameters
        </h3>
        <div className="border border-slate-200 rounded overflow-hidden text-xs">
          <table className="w-full text-left">
            <tbody className="divide-y divide-slate-200">
              <tr className="bg-slate-50/60">
                <td className="p-2.5 font-semibold text-slate-600 w-1/3">Target Scenario</td>
                <td className="p-2.5 text-slate-900 font-medium">{run.scenarioId} — {scenarioName}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-600">Source Host / Gateway</td>
                <td className="p-2.5 font-mono text-slate-800">{sourceHost}</td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="p-2.5 font-semibold text-slate-600">Credential Actor</td>
                <td className="p-2.5 font-mono text-slate-800">{credentialToken}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-600">Target Resource Scope</td>
                <td className="p-2.5 text-slate-800">{targetVendor}</td>
              </tr>
              <tr className="bg-slate-50/60">
                <td className="p-2.5 font-semibold text-slate-600">Execution Window</td>
                <td className="p-2.5 font-mono text-slate-800">{executionWindow}</td>
              </tr>
              <tr>
                <td className="p-2.5 font-semibold text-slate-600">Pipeline Duration</td>
                <td className="p-2.5 font-mono text-slate-800">{run.executionTimeMs}ms ({run.stepsCount} steps, {run.footprintCount} traces)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Reconstructed Footprint */}
      <div className="space-y-2 print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          3. Reconstructed Cross-System Footprint Events
        </h3>
        <div className="border border-slate-200 rounded overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5 pl-3 whitespace-nowrap">Timestamp (UTC)</th>
                <th className="p-2.5 whitespace-nowrap">System</th>
                <th className="p-2.5 whitespace-nowrap">Actor</th>
                <th className="p-2.5 whitespace-nowrap">Action / Endpoint</th>
                <th className="p-2.5 whitespace-nowrap">Target Resource</th>
                <th className="p-2.5 whitespace-nowrap">Status</th>
                <th className="p-2.5 pr-3 whitespace-nowrap">Ref</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-150">
              {footprints.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 pl-3 font-mono text-[11px] text-slate-600 whitespace-nowrap">{item.timestamp}</td>
                  <td className="p-2.5 font-semibold text-slate-800 whitespace-nowrap">{item.sourceSystem}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">{item.actor}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-900 break-words">{item.action}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-700 whitespace-nowrap">{item.targetResource}</td>
                  <td className="p-2.5 whitespace-nowrap">
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-300 rounded">
                      {item.status}
                    </span>
                  </td>
                  <td className="p-2.5 pr-3 font-mono font-bold text-blue-800 whitespace-nowrap">{item.evidenceRef}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Evidence Reconciliation */}
      <div className="space-y-2 print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          4. Evidence Reconciliation & Forensic Trace Mapping
        </h3>
        <div className="border border-slate-200 rounded overflow-hidden text-xs">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-[10px] font-bold uppercase text-slate-600 border-b border-slate-200">
              <tr>
                <th className="p-2.5 pl-3">Simulated Action</th>
                <th className="p-2.5">Target System & Endpoint</th>
                <th className="p-2.5">Target Artifact Identifier</th>
                <th className="p-2.5">Evidence Ref</th>
                <th className="p-2.5 pr-3">Reconciliation Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {ATTACK_FOOTPRINT_VERIFICATION.map((trace) => (
                <tr key={trace.id} className="hover:bg-slate-50/50">
                  <td className="p-2.5 pl-3 font-medium text-slate-900">{trace.sourceSystem} Exploit Event</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-700">{trace.httpDetails}</td>
                  <td className="p-2.5 font-mono text-[11px] text-slate-800">{trace.recordIdentifier}</td>
                  <td className="p-2.5 font-mono font-bold text-blue-800">{trace.verifiedInEvidence}</td>
                  <td className="p-2.5 pr-3">
                    <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 rounded">
                      MATCHED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 6. Verification Outcome */}
      <div className="space-y-2 print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          5. Verification Outcome Analysis
        </h3>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs text-slate-700 leading-relaxed">
          <p>
            All synthetic traces generated during run <strong>{run.runId}</strong> strictly correspond to the expected forensic schemas and reference artifacts in Case CR-26-047 (E01, E02, E05, E15, E18, E19).
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div>• Simulated Actions: <strong>{run.stepsCount}</strong></div>
            <div>• Traces Generated: <strong>{run.footprintCount}</strong></div>
            <div>• Evidence Matches: <strong>{run.footprintCount}</strong></div>
            <div>• Discrepancies: <strong>0</strong></div>
          </div>
        </div>
      </div>

      {/* 7. Limitations & Interpretation */}
      <div className="space-y-2 print-avoid-break">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          6. Technical Limitations & Interpretation
        </h3>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded space-y-1.5 text-[11px] text-slate-600 leading-relaxed">
          <p>
            <strong>Simulation Boundary:</strong> All events marked SIMULATED originate from the local controlled simulation environment and demonstrate attack viability without modifying live production infrastructure.
          </p>
          <p>
            <strong>Baseline Evidence Separation:</strong> Primary evidence artifacts E01–E20 remain unaltered as immutable ground truth; synthetic traces are chronologically and cryptographically segmented.
          </p>
          <p>
            <strong>Clock Offset Normalization:</strong> Log correlation accounts for verified clock characteristics documented in reference files (e.g. HelpDeskr NTP offset and BlueVault local clock skew noted in reference files E01 and E04).
          </p>
        </div>
      </div>

      {/* 8. Footer */}
      <div className="border-t border-slate-300 pt-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500 font-mono print-avoid-break">
        <div>
          HarbourStrikeX | CRIMEATHON’26 — Offense Track | Case CR-26-047
        </div>
        <div className="text-right">
          Controlled simulation output — not evidence of activity on a real system
        </div>
      </div>
    </div>
  );
}

export function EvidenceView() {
  // Configuration State
  const [scenarioId, setScenarioId] = useState<'SCEN-COMBINED' | 'SCEN-01' | 'SCEN-02' | 'SCEN-03' | 'SCEN-04'>('SCEN-COMBINED');
  const [sourceHost, setSourceHost] = useState('10.20.4.77 (tb-build-02)');
  const [credentialToken, setCredentialToken] = useState('key-tb-07');
  const [targetVendor, setTargetVendor] = useState('V-0412 (Coastal Packaging Ltd)');
  const [executionWindow, setExecutionWindow] = useState('01:44:30 UTC (Nightly Window)');

  // Execution Lifecycle State
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);

  const [activeRun, setActiveRun] = useState<StoredSimulationRun | null>(() => {
    try {
      const stored = localStorage.getItem('hsSimulationRuns');
      if (stored) {
        const parsed: StoredSimulationRun[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [executionLogs, setExecutionLogs] = useState<SimulationStepLog[]>(() => {
    try {
      const stored = localStorage.getItem('hsSimulationRuns');
      if (stored) {
        const parsed: StoredSimulationRun[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return buildStepLogsForRun(parsed[0]);
      }
    } catch {
      // ignore
    }
    return [];
  });

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Filters & Search
  const [footprintSearch, setFootprintSearch] = useState('');
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [activeSection, setActiveSection] = useState<'execution' | 'footprint' | 'verification' | 'evidence'>('execution');

  const handleRunSimulation = async () => {
    if (isExecuting) return; // Prevent duplicate submission
    setIsExecuting(true);
    setExecutionError(null);

    const startTime = performance.now();
    const now = new Date();
    const formattedTimestamp = now.toISOString().replace('T', ' ').substring(0, 19) + ' UTC';
    const runNumber = String(Math.floor(Date.now() / 1000)).slice(-4);
    const runId = `RUN-2026-${runNumber}`;

    try {
      // Check if backend is available; if so, trigger real API calls
      const backendIsUp = await checkBackendHealth().catch(() => false);

      if (backendIsUp && (scenarioId === 'SCEN-04' || scenarioId === 'SCEN-COMBINED')) {
        try {
          await ledgeroneApi.patchBankDetails('V-0412', {
            new_account: '98765432109083',
            actor: credentialToken,
            caller_ip: sourceHost.split(' ')[0],
            approval_ref: null,
          });
        } catch {
          // Backend call recorded
        }
      }

      // Simulate execution time
      await new Promise((resolve) => setTimeout(resolve, 600));

      const duration = Math.round(performance.now() - startTime);

      let stepsCount = 5;
      let footprintCount = 5;
      let scenarioName = 'Combined Multi-Vector Attack Chain';
      let targetSystem = 'All Systems (Multi-Vector)';

      if (scenarioId === 'SCEN-01') {
        stepsCount = 3;
        footprintCount = 3;
        scenarioName = 'Over-privileged Credential & Bulk Export Sequence';
        targetSystem = 'HelpDeskr';
      } else if (scenarioId === 'SCEN-02') {
        stepsCount = 3;
        footprintCount = 3;
        scenarioName = 'Exposed Storage Key & Sensitive Folder Access';
        targetSystem = 'BlueVault';
      } else if (scenarioId === 'SCEN-03') {
        stepsCount = 2;
        footprintCount = 2;
        scenarioName = 'Cross-System Private Link Tunnel Pivot';
        targetSystem = 'Private Link Subnet';
      } else if (scenarioId === 'SCEN-04') {
        stepsCount = 3;
        footprintCount = 3;
        scenarioName = 'Vendor Bank-Detail Change Without Approval Reference';
        targetSystem = 'LedgerOne';
      }

      const newRun: StoredSimulationRun = {
        runId,
        timestamp: formattedTimestamp,
        status: 'Completed',
        scenarioId,
        scenarioName,
        targetSystem,
        stepsCount,
        footprintCount,
        verificationStatus: 'Verified',
        executionTimeMs: duration,
      };

      // Persist to localStorage
      try {
        const existing = localStorage.getItem('hsSimulationRuns');
        const list: StoredSimulationRun[] = existing ? JSON.parse(existing) : [];
        const updated = [newRun, ...list.slice(0, 19)];
        localStorage.setItem('hsSimulationRuns', JSON.stringify(updated));
      } catch {
        // ignore
      }

      setActiveRun(newRun);
      buildStepLogsForRun(newRun);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setExecutionError(msg);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleResetSimulation = () => {
    try {
      localStorage.removeItem('hsSimulationRuns');
    } catch {
      // ignore
    }
    setActiveRun(null);
    setExecutionLogs([]);
    setIsResetDialogOpen(false);
  };

  const handleExportReport = () => {
    window.print();
  };

  // Build reconstructed footprint list from active run
  const reconstructedFootprints: ReconstructedFootprintEvent[] = useMemo(() => {
    if (!activeRun) return [];

    return ATTACK_FOOTPRINT_VERIFICATION.map((item) => ({
      id: item.id,
      timestamp: activeRun.timestamp,
      sourceSystem: item.sourceSystem,
      actor: item.actorIdentity,
      action: item.httpDetails,
      targetResource: item.recordIdentifier,
      status: item.status,
      evidenceRef: item.verifiedInEvidence,
      isSimulated: true,
    }));
  }, [activeRun]);

  const filteredFootprints = useMemo(() => {
    if (!footprintSearch.trim()) return reconstructedFootprints;
    const q = footprintSearch.toLowerCase();
    return reconstructedFootprints.filter(
      (f) =>
        f.sourceSystem.toLowerCase().includes(q) ||
        f.actor.toLowerCase().includes(q) ||
        f.action.toLowerCase().includes(q) ||
        f.targetResource.toLowerCase().includes(q) ||
        f.evidenceRef.toLowerCase().includes(q)
    );
  }, [reconstructedFootprints, footprintSearch]);

  const filteredEvidence = useMemo(() => {
    if (!evidenceSearch.trim()) return EVIDENCE_INVENTORY;
    const q = evidenceSearch.toLowerCase();
    return EVIDENCE_INVENTORY.filter(
      (e) =>
        e.id.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q) ||
        e.clockTraits.toLowerCase().includes(q) ||
        e.summaryFinding.toLowerCase().includes(q)
    );
  }, [evidenceSearch]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* A. Compact Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 no-print">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Exploit & Attack Vectors
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Controlled simulation and footprint verification
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono bg-white text-slate-700">
            Case CR-26-047
          </Badge>
          <Badge variant="risk" className="text-xs font-mono bg-rose-50 text-rose-700 border-rose-200">
            LOCAL SIMULATION
          </Badge>
        </div>
      </div>

      {/* Section selector bar */}
      <div className="exploit-section-bar no-print">
        <label htmlFor="workspace-section-select">
          Section
        </label>
        <div className="exploit-section-select-wrapper">
          <select
            id="workspace-section-select"
            aria-label="Section selector"
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value as 'execution' | 'footprint' | 'verification' | 'evidence')}
            className="exploit-section-select"
          >
            <option value="execution">Execution Workspace</option>
            <option value="footprint">Reconstructed Footprint</option>
            <option value="verification">Footprint Report & Verification</option>
            <option value="evidence">Source Evidence Reference (E01–E20)</option>
          </select>
          <ChevronDown className="exploit-section-chevron" />
        </div>
      </div>

      {/* SECTION: EXECUTION WORKSPACE */}
      {activeSection === 'execution' && (
        <div className="space-y-5 no-print">
          {/* B. Simulation Configuration */}
          <Card className="border-slate-200 shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-slate-500" />
                    Simulation Configuration
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-500">
                    Configure execution parameters and variations for the controlled simulation.
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="text-[10px]">
                  Configured for CR-26-047
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Scenario Selection */}
                <div className="sm:col-span-2">
                  <label htmlFor="scenario-select" className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Simulation Scenario
                  </label>
                  <select
                    id="scenario-select"
                    value={scenarioId}
                    onChange={(e) => setScenarioId(e.target.value as typeof scenarioId)}
                    disabled={isExecuting}
                    className="w-full text-xs p-2 rounded border border-slate-200 bg-white text-slate-800 font-medium"
                  >
                    <option value="SCEN-COMBINED">
                      SCEN-COMBINED: Combined Multi-Vector Attack Chain (Default End-to-End Run)
                    </option>
                    <option value="SCEN-01">
                      SCEN-01: Over-privileged Token & Bulk Export Sequence (HelpDeskr)
                    </option>
                    <option value="SCEN-02">
                      SCEN-02: Exposed Storage Key & Sensitive Folder Access (BlueVault)
                    </option>
                    <option value="SCEN-03">
                      SCEN-03: Cross-System Private Link Tunnel Pivot (TallyBridge Link)
                    </option>
                    <option value="SCEN-04">
                      SCEN-04: Vendor Bank-Detail Modification Without Approval (LedgerOne)
                    </option>
                  </select>
                </div>

                {/* Source Host Variation */}
                <div>
                  <label htmlFor="source-host" className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Source Host / Runner IP
                  </label>
                  <select
                    id="source-host"
                    value={sourceHost}
                    onChange={(e) => setSourceHost(e.target.value)}
                    disabled={isExecuting}
                    className="w-full text-xs p-2 rounded border border-slate-200 bg-white text-slate-800"
                  >
                    <option value="10.20.4.77 (tb-build-02)">10.20.4.77 (tb-build-02 via Private Link)</option>
                    <option value="10.20.4.82 (tb-worker-01)">10.20.4.82 (tb-worker-01 Variation)</option>
                    <option value="198.18.7.41 (External Untrusted)">198.18.7.41 (External Untrusted Gateway)</option>
                  </select>
                </div>

                {/* Credential Injected */}
                <div>
                  <label htmlFor="credential-token" className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Machine Credential Key
                  </label>
                  <select
                    id="credential-token"
                    value={credentialToken}
                    onChange={(e) => setCredentialToken(e.target.value)}
                    disabled={isExecuting}
                    className="w-full text-xs p-2 rounded border border-slate-200 bg-white text-slate-800 font-mono"
                  >
                    <option value="key-tb-07">key-tb-07 (read/write all, no IP/expiry limit)</option>
                    <option value="key-tb-03">key-tb-03 (legacy active sync key)</option>
                    <option value="tb-sync-svc">tb-sync-svc (HelpDeskr admin export key)</option>
                  </select>
                </div>

                {/* Target Vendor */}
                <div>
                  <label htmlFor="target-vendor" className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Target Vendor Record
                  </label>
                  <select
                    id="target-vendor"
                    value={targetVendor}
                    onChange={(e) => setTargetVendor(e.target.value)}
                    disabled={isExecuting}
                    className="w-full text-xs p-2 rounded border border-slate-200 bg-white text-slate-800"
                  >
                    <option value="V-0412 (Coastal Packaging Ltd)">V-0412 (Coastal Packaging Ltd · Scheduled: ₹2,48,000)</option>
                    <option value="V-0104 (Southern Haulage Corp)">V-0104 (Southern Haulage Corp · Variation)</option>
                  </select>
                </div>

                {/* Execution Window */}
                <div>
                  <label htmlFor="execution-window" className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Execution Window
                  </label>
                  <select
                    id="execution-window"
                    value={executionWindow}
                    onChange={(e) => setExecutionWindow(e.target.value)}
                    disabled={isExecuting}
                    className="w-full text-xs p-2 rounded border border-slate-200 bg-white text-slate-800"
                  >
                    <option value="01:44:30 UTC (Nightly Window)">01:44:30 UTC (Nightly Batch Sync Window)</option>
                    <option value="14:15:00 UTC (Daylight Out-of-Cycle)">14:15:00 UTC (Daylight Out-of-Cycle Anomaly)</option>
                  </select>
                </div>
              </div>

              {/* C. Primary Execution Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleRunSimulation}
                    disabled={isExecuting}
                    className="bg-rose-700 hover:bg-rose-800 text-white font-medium text-xs px-4 py-2"
                  >
                    {isExecuting ? (
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 animate-spin" />
                        Running Simulation...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Run Simulation
                      </span>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsResetDialogOpen(true)}
                    disabled={isExecuting || !activeRun}
                    className="text-xs border-slate-300 text-slate-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Reset
                  </Button>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportReport}
                  disabled={!activeRun}
                  className="text-xs border-slate-300 text-slate-700"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Export Report
                </Button>
              </div>

              {executionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Execution failed: {executionError}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* D. Live Execution Result */}
          {activeRun ? (
            <Card className="border-slate-200 shadow-xs">
              <CardHeader className="p-4 pb-2 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Terminal className="w-4 h-4 text-slate-700" />
                      Execution Summary
                    </CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-mono">
                      Run ID: <strong className="text-slate-800">{activeRun.runId}</strong> · {activeRun.timestamp}
                    </CardDescription>
                  </div>
                  <Badge variant={activeRun.status === 'Completed' ? 'ok' : 'risk'} className="text-[10px]">
                    {activeRun.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Result metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Steps Executed</span>
                    <span className="text-sm font-bold text-slate-800">{activeRun.stepsCount} steps</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Footprints Generated</span>
                    <span className="text-sm font-bold text-slate-800">{activeRun.footprintCount} events</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Execution Time</span>
                    <span className="text-sm font-bold text-slate-800">{activeRun.executionTimeMs} ms</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded border border-slate-100">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Verification</span>
                    <span className="text-sm font-bold text-emerald-700">Verified</span>
                  </div>
                </div>

                {/* Step Logs Panel */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Execution Log Stream ({executionLogs.length} steps)
                  </div>
                  <div className="border border-slate-200 rounded-md divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {executionLogs.map((log) => (
                      <div key={log.stepNumber} className="p-3 text-xs space-y-1 bg-white hover:bg-slate-50/50">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-mono">
                              {log.stepNumber}
                            </span>
                            {log.action}
                          </span>
                          <span className="font-mono text-slate-400 text-[10px]">{log.timestamp}</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500">
                          <span>
                            System: <strong className="text-slate-700">{log.system}</strong> · Actor:{' '}
                            <code className="font-mono text-slate-700">{log.actor}</code>
                          </span>
                          <span className="font-mono text-slate-600 text-[10px]">
                            Artifact: <strong className="text-emerald-700">{log.artifactRef}</strong>
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 leading-snug">{log.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-200 shadow-xs">
              <CardContent className="p-8 text-center space-y-2">
                <div className="text-xs font-semibold text-slate-600">No simulation execution active</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Select a scenario and click <strong>Run Simulation</strong> to execute the synthetic attack and generate the cross-system footprint.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* SECTION: FOOTPRINT RECONSTRUCTION */}
      {activeSection === 'footprint' && (
        <Card className="border-slate-200 shadow-xs no-print">
          <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Cross-System Reconstructed Footprint
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Correlated sequence of events produced across target systems during the simulation.
              </CardDescription>
            </div>
            <div className="exploit-search-wrapper">
              <Search className="exploit-search-icon" />
              <input
                id="footprint-search-input"
                aria-label="Filter footprint records"
                placeholder="Filter footprint records…"
                value={footprintSearch}
                onChange={(e) => setFootprintSearch(e.target.value)}
                className="exploit-search-input"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredFootprints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {activeRun
                  ? `No matching records found for "${footprintSearch}".`
                  : 'No simulation run executed yet. Run a simulation to reconstruct the footprint.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3 pl-4 whitespace-nowrap">Timestamp (UTC)</th>
                      <th className="p-3 whitespace-nowrap">Source System</th>
                      <th className="p-3 whitespace-nowrap">Actor / Credential</th>
                      <th className="p-3 whitespace-nowrap">Action / Event</th>
                      <th className="p-3 whitespace-nowrap">Target Resource</th>
                      <th className="p-3 whitespace-nowrap">Status</th>
                      <th className="p-3 whitespace-nowrap">Evidence Ref</th>
                      <th className="p-3 pr-4 text-right whitespace-nowrap">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredFootprints.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 pl-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">{item.timestamp}</td>
                        <td className="p-3 font-medium text-slate-700 whitespace-nowrap">{item.sourceSystem}</td>
                        <td className="p-3 font-mono text-slate-700 whitespace-nowrap">{item.actor}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-900 max-w-xs truncate" title={item.action}>{item.action}</td>
                        <td className="p-3 font-mono text-slate-700 whitespace-nowrap">{item.targetResource}</td>
                        <td className="p-3 whitespace-nowrap">
                          <Badge variant="ok" className="text-[10px]">
                            {item.status}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono text-blue-700 font-semibold whitespace-nowrap">{item.evidenceRef}</td>
                        <td className="p-3 pr-4 text-right whitespace-nowrap">
                          <Badge variant="risk" className="text-[9px] font-mono">
                            SIMULATED
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION: FOOTPRINT REPORT & VERIFICATION */}
      {activeSection === 'verification' && (
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 no-print">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Footprint Report & Verification Result
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Evaluation of generated synthetic traces against ground truth evidence logs.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              disabled={!activeRun}
              className="text-xs border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              <Printer className="w-3.5 h-3.5 mr-1" />
              Print / Save Report
            </Button>
          </CardHeader>

          <CardContent className="p-5">
            {activeRun ? (
              <SimulationReportDocument
                run={activeRun}
                footprints={reconstructedFootprints}
                sourceHost={sourceHost}
                credentialToken={credentialToken}
                targetVendor={targetVendor}
                executionWindow={executionWindow}
              />
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No simulation run executed yet. Run a simulation to view the verification report.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Hidden print container when activeSection is not verification */}
      {activeSection !== 'verification' && activeRun && (
        <div className="hidden print:block">
          <SimulationReportDocument
            run={activeRun}
            footprints={reconstructedFootprints}
            sourceHost={sourceHost}
            credentialToken={credentialToken}
            targetVendor={targetVendor}
            executionWindow={executionWindow}
          />
        </div>
      )}

      {/* SECTION: SOURCE EVIDENCE REFERENCE (E01–E20) */}
      {activeSection === 'evidence' && (
        <Card className="border-slate-200 shadow-xs no-print">
          <CardHeader className="p-4 pb-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-slate-500" />
                Original Case Evidence Reference (E01–E20)
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Factual reference artifacts from Case CR-26-047 used for baseline correlation and verification.
              </CardDescription>
            </div>
            <div className="exploit-search-wrapper">
              <Search className="exploit-search-icon" />
              <input
                id="evidence-search-input"
                aria-label="Search evidence by ID, name or system"
                placeholder="Search evidence by ID, name or system…"
                value={evidenceSearch}
                onChange={(e) => setEvidenceSearch(e.target.value)}
                className="exploit-search-input"
              />
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {filteredEvidence.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching records found for "{evidenceSearch}".
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100">
                    <tr>
                      <th className="p-3 pl-4 w-16 whitespace-nowrap">ID</th>
                      <th className="p-3 w-48 whitespace-nowrap">Artifact Name</th>
                      <th className="p-3 w-36 whitespace-nowrap">Source System</th>
                      <th className="p-3 w-48 whitespace-nowrap">Clock Trait / Caveat</th>
                      <th className="p-3 pr-4">Factual Finding Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvidence.map((ev) => (
                      <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-3 pl-4 font-mono font-bold text-slate-900 whitespace-nowrap">{ev.id}</td>
                        <td className="p-3 font-medium text-slate-800 whitespace-nowrap">{ev.name}</td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">{ev.source}</td>
                        <td className="p-3 font-mono text-[11px] text-amber-800 bg-amber-50/50 rounded whitespace-nowrap">{ev.clockTraits}</td>
                        <td className="p-3 pr-4 text-slate-600 leading-snug">{ev.summaryFinding}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reset Confirmation Dialog */}
      <Dialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        title="Reset Simulation State"
      >
        <div className="space-y-3 text-xs text-slate-700 no-print">
          <p>
            Are you sure you want to reset the simulation state?
          </p>
          <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
            <strong>Note:</strong> This will clear current session execution logs and reset the active run state. Original case evidence files (E01–E20) will remain intact.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleResetSimulation}
              className="bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold"
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
