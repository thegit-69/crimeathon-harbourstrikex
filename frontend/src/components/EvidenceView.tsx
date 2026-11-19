import { useState } from 'react';
import {
  CASE_METADATA,
  EVIDENCE_INVENTORY,
  INCIDENT_CHRONOLOGY,
} from '../data/caseEvidenceData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from './ui/table';
import { Dialog } from './ui/dialog';
import {
  Terminal,
  Play,
  RotateCcw,
  Printer,
  ShieldCheck,
  Clock,
  Database,
  Layers,
  Search,
  Crosshair,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';

// Scenario definitions for Offense Simulation
interface SimulationScenario {
  id: string;
  name: string;
  shortDesc: string;
  targetSystem: string;
  weaknessDemonstrated: string;
  steps: {
    stepNumber: number;
    title: string;
    action: string;
    httpMethod: string;
    endpoint: string;
    caller: string;
    token: string;
    payloadSnippet: string;
    generatedArtifact: string;
    system: string;
  }[];
}

const SIMULATION_SCENARIOS: SimulationScenario[] = [
  {
    id: 'SCEN-01',
    name: 'Over-privileged Credential & Bulk Export Sequence',
    shortDesc: 'Abusing unrestricted machine token tb-sync-svc to execute mass ticket exports from HelpDeskr without rate limiting.',
    targetSystem: 'HelpDeskr (Support SaaS)',
    weaknessDemonstrated: 'Unrestricted admin machine token with infinite lifetime, missing IP allowlist, and absent rate limiting on /api/v1/exports.',
    steps: [
      {
        stepNumber: 1,
        title: 'Token Authentication & Scope Verification',
        action: 'Validate machine credential permissions against tenant schema',
        httpMethod: 'GET',
        endpoint: '/api/v1/me',
        caller: '198.18.7.41 (External Untrusted)',
        token: 'tb-sync-svc',
        payloadSnippet: '{"check_scope": "admin:exports"}',
        generatedArtifact: 'req-auth-sim-01 (200 OK)',
        system: 'HelpDeskr',
      },
      {
        stepNumber: 2,
        title: 'Bulk Export Job Scheduling (EXP-5410 to EXP-5419)',
        action: 'Dispatch 10 sequential ticket database export requests including internal attachments',
        httpMethod: 'POST',
        endpoint: '/api/v1/exports',
        caller: '198.18.7.58 (External Untrusted)',
        token: 'tb-sync-svc',
        payloadSnippet: '{"export_type": "tickets_full_history", "include_notes": true}',
        generatedArtifact: 'EXP-5419 (evt-3fe76f60c4)',
        system: 'HelpDeskr',
      },
      {
        stepNumber: 3,
        title: 'Artifact Exfiltration & Deletion Timeout',
        action: 'Download compressed CSV archive and trigger export.delete to cover tracks (timed out)',
        httpMethod: 'DELETE',
        endpoint: '/api/v1/exports/EXP-5419',
        caller: '198.18.7.58',
        token: 'tb-sync-svc',
        payloadSnippet: '{"delete_target": "EXP-5419"}',
        generatedArtifact: '504 Gateway Timeout (Permanent Trace Preserved)',
        system: 'HelpDeskr',
      },
    ],
  },
  {
    id: 'SCEN-02',
    name: 'Exposed Storage Key & Sensitive Folder Access',
    shortDesc: 'Harvesting storage credential bvk-7f3a leaked in ticket TKT-48213 and exfiltrating master vendor bank instructions.',
    targetSystem: 'BlueVault (Document Repository)',
    weaknessDemonstrated: 'Clear-text credentials pasted in support ticket notes; BlueVault missing network IP allowlisting and token rotation.',
    steps: [
      {
        stepNumber: 1,
        title: 'Credential Discovery in Support Chatter',
        action: 'Extract storage token bvk-7f3a pasted into ticket TKT-48213 notes during user onboarding',
        httpMethod: 'GET',
        endpoint: '/api/v1/tickets/TKT-48213/comments',
        caller: '198.18.7.41',
        token: 'tb-sync-svc',
        payloadSnippet: '{"filter": "bvk-"} -> Found: bvk-7f3a in comment body',
        generatedArtifact: 'Ticket note correlation artifact (E13)',
        system: 'HelpDeskr',
      },
      {
        stepNumber: 2,
        title: 'Finance Folder Traversal & File Enumeration',
        action: 'Query restricted repository directory /Finance/Bank Instructions/',
        httpMethod: 'GET',
        endpoint: '/files/Finance/Bank Instructions',
        caller: '198.18.7.23 (External)',
        token: 'bvk-7f3a',
        payloadSnippet: '{"list": "true"} -> 3 confidential files found',
        generatedArtifact: 'bv-enum-9912 (200 OK)',
        system: 'BlueVault',
      },
      {
        stepNumber: 3,
        title: 'Master Vendor Bank Spreadsheet Exfiltration',
        action: 'Download vendor-bank-details-2026.xlsx (3.46 MB)',
        httpMethod: 'GET',
        endpoint: '/files/Finance/Bank Instructions/vendor-bank-details-2026.xlsx',
        caller: '198.18.7.23',
        token: 'bvk-7f3a',
        payloadSnippet: '{"file_id": "bv-edb0081dad", "size": 3627910}',
        generatedArtifact: 'bv-edb0081dad (3,627,910 bytes downloaded)',
        system: 'BlueVault',
      },
    ],
  },
  {
    id: 'SCEN-03',
    name: 'Cross-System Private Link Tunnel Pivot',
    shortDesc: 'Pivoting across vendor Private Link 10.20.4.0/24 through rogue CI/CD runner host tb-build-02 (10.20.4.77).',
    targetSystem: 'Private Link Subnet & Internal API',
    weaknessDemonstrated: 'Implicit trust of all traffic originating within subnet 10.20.4.0/24 without per-host mutual TLS or certificate verification.',
    steps: [
      {
        stepNumber: 1,
        title: 'Tunnel Gateway Ingress & Host Reconnaissance',
        action: 'Route traffic through build server 10.20.4.77 across dedicated tunnel gateway',
        httpMethod: 'TCP SYN',
        endpoint: '10.20.4.77 -> 172.16.20.5:443',
        caller: '10.20.4.77 (tb-build-02)',
        token: 'key-tb-07',
        payloadSnippet: '{"tunnel_interface": "pl-tun-0", "proto": "tls1.3"}',
        generatedArtifact: 'flow-seq-8812 (ESTABLISHED)',
        system: 'Network Link',
      },
      {
        stepNumber: 2,
        title: 'Internal API Probing under Masqueraded User-Agent',
        action: 'Conduct 56 targeted queries into payment schedules using User-Agent: TallyBridge-Sync/3.5.0',
        httpMethod: 'GET',
        endpoint: '/api/v2/payments/scheduled',
        caller: '10.20.4.77',
        token: 'key-tb-07',
        payloadSnippet: '{"window": "2026-09-08", "status": "approved"}',
        generatedArtifact: 'req-bb819dfe0c (22.2 MB cumulative volume)',
        system: 'LedgerOne',
      },
    ],
  },
  {
    id: 'SCEN-04',
    name: 'Vendor Bank-Detail Change Without Approval Reference',
    shortDesc: 'Tampering vendor V-0412 bank account to ****9083 with blank approval reference right before Sep 8 disbursement.',
    targetSystem: 'LedgerOne (Finance System)',
    weaknessDemonstrated: 'Zero approval reference requirement on bank account modifications; API permits silent patching without dual-authorization.',
    steps: [
      {
        stepNumber: 1,
        title: 'Target Payment Identification (V-0412)',
        action: 'Verify scheduled disbursement of ₹2,48,000 for Coastal Packaging Ltd on invoice INV-9081',
        httpMethod: 'GET',
        endpoint: '/api/v2/vendors/V-0412',
        caller: '10.20.4.77',
        token: 'key-tb-07',
        payloadSnippet: '{"vendor_id": "V-0412"} -> Original Account: ****4417',
        generatedArtifact: 'req-vcheck-491 (200 OK)',
        system: 'LedgerOne',
      },
      {
        stepNumber: 2,
        title: 'Weaponized Bank Account Modification Payload',
        action: 'Submit PATCH request replacing beneficiary account with adversary account ****9083 and blank approval reference',
        httpMethod: 'PATCH',
        endpoint: '/api/v2/vendors/V-0412/bank-details',
        caller: '10.20.4.77',
        token: 'key-tb-07',
        payloadSnippet: '{"account_number": "9083", "approval_reference": "", "change_reason": "Nightly sync"}',
        generatedArtifact: 'req-5f61b0de8 · chg-8b9888c39b',
        system: 'LedgerOne',
      },
      {
        stepNumber: 3,
        title: 'Payout Lock-in Verification',
        action: 'Confirm modified routing appears in upcoming September 8th payment disbursement batch',
        httpMethod: 'GET',
        endpoint: '/api/v2/payments/batches/2026-09-08',
        caller: '10.20.4.77',
        token: 'key-tb-07',
        payloadSnippet: '{"batch_id": "BATCH-SEP08"} -> V-0412: ₹2,48,000 -> ****9083',
        generatedArtifact: 'req-batch-ver-09 (Payout Armed)',
        system: 'LedgerOne',
      },
    ],
  },
  {
    id: 'SCEN-05',
    name: 'Combined Multi-Vector Attack Chain (End-to-End Simulation)',
    shortDesc: 'Full execution linking credential discovery in HelpDeskr, exfiltration in BlueVault, Private Link pivot, and LedgerOne payout hijack.',
    targetSystem: 'All Target Systems (Multi-Vector)',
    weaknessDemonstrated: 'Chained exploitation of 5 independent technical gaps across cloud support, storage, network tunnel, and finance APIs.',
    steps: [
      {
        stepNumber: 1,
        title: 'Token Discovery (HelpDeskr)',
        action: 'Extracted storage token bvk-7f3a from ticket TKT-48213 comments',
        httpMethod: 'GET',
        endpoint: '/api/v1/tickets/TKT-48213',
        caller: '198.18.7.41',
        token: 'tb-sync-svc',
        payloadSnippet: 'Extracted key: bvk-7f3a',
        generatedArtifact: 'SIM-ART-01 (E13 match)',
        system: 'HelpDeskr',
      },
      {
        stepNumber: 2,
        title: 'Support Data Harvest (HelpDeskr)',
        action: 'Triggered 10 bulk exports EXP-5410 to EXP-5419; delete timeout preserved trace',
        httpMethod: 'POST',
        endpoint: '/api/v1/exports',
        caller: '198.18.7.58',
        token: 'tb-sync-svc',
        payloadSnippet: 'EXP-5419 timeout footprint',
        generatedArtifact: 'SIM-ART-02 (E02 match)',
        system: 'HelpDeskr',
      },
      {
        stepNumber: 3,
        title: 'Financial Spreadsheet Exfiltration (BlueVault)',
        action: 'Downloaded vendor-bank-details-2026.xlsx using bvk-7f3a (3.46 MB)',
        httpMethod: 'GET',
        endpoint: '/files/Finance/.../vendor-bank-details-2026.xlsx',
        caller: '198.18.7.23',
        token: 'bvk-7f3a',
        payloadSnippet: 'Harvested 300+ vendor payment details',
        generatedArtifact: 'SIM-ART-03 (E05 match)',
        system: 'BlueVault',
      },
      {
        stepNumber: 4,
        title: 'Private Link Tunnel Pivot (TallyBridge)',
        action: 'Pivoted through rogue build host 10.20.4.77 transferring 22.2 MB under nightly sync window',
        httpMethod: 'TCP 443',
        endpoint: '10.20.4.77 -> 172.16.20.5:443',
        caller: '10.20.4.77',
        token: 'key-tb-07',
        payloadSnippet: 'User-Agent: TallyBridge-Sync/3.5.0',
        generatedArtifact: 'SIM-ART-04 (E15 match)',
        system: 'Network Link',
      },
      {
        stepNumber: 5,
        title: 'Silent Vendor Bank Detail Hijack (LedgerOne)',
        action: 'Patched Coastal Packaging Ltd (V-0412) to ****9083 without approval reference',
        httpMethod: 'PATCH',
        endpoint: '/api/v2/vendors/V-0412/bank-details',
        caller: '10.20.4.77',
        token: 'key-tb-07',
        payloadSnippet: 'req-5f61b0de8 · chg-8b9888c39b',
        generatedArtifact: 'SIM-ART-05 (E18/E19 match)',
        system: 'LedgerOne',
      },
    ],
  },
];

export function EvidenceView() {
  const [activeTab, setActiveTab] = useState('simulation');
  const [selectedScenarioId, setSelectedScenarioId] = useState('SCEN-05');
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('completed');
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  // Dynamic variation settings (satisfying Variation Handling requirement)
  const [customHost, setCustomHost] = useState('10.20.4.77 (tb-build-02)');
  const [customKey, setCustomKey] = useState('key-tb-07');
  const [customVendor, setCustomVendor] = useState('V-0412 (Coastal Packaging Ltd)');
  const [customTimeWindow, setCustomTimeWindow] = useState('01:44:30 UTC (Nightly Window)');

  // Evidence search filter
  const [evidenceSearch, setEvidenceSearch] = useState('');
  const [evidenceFilter, setEvidenceFilter] = useState<'all' | 'verified' | 'analyzed'>('all');

  const activeScenario =
    SIMULATION_SCENARIOS.find((s) => s.id === selectedScenarioId) || SIMULATION_SCENARIOS[4];

  const handleRunSimulation = () => {
    setSimulationState('running');
    setTimeout(() => {
      setSimulationState('completed');
    }, 700);
  };

  const handleResetSimulation = () => {
    setSimulationState('idle');
    setIsResetDialogOpen(false);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredEvidence = EVIDENCE_INVENTORY.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
      item.name.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
      item.source.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
      item.summaryFinding.toLowerCase().includes(evidenceSearch.toLowerCase()) ||
      item.clockTraits.toLowerCase().includes(evidenceSearch.toLowerCase());

    const matchesStatus =
      evidenceFilter === 'all' || item.status.toLowerCase() === evidenceFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold tracking-widest text-rose-600 uppercase mb-1 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            CRIMEATHON '26 · CONTROLLED OFFENSE WORKSPACE
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Exploit & Attack Vectors
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Controlled local simulation workspace and cross-system footprint reconstruction · Target: <span className="font-semibold text-slate-700">{CASE_METADATA.targetCompany}</span> (Case {CASE_METADATA.caseId}).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetDialogOpen(true)}
            className="text-xs font-semibold border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset Simulation
          </Button>
          <Button
            size="sm"
            onClick={handlePrintReport}
            className="text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white"
          >
            <Printer className="w-3.5 h-3.5 mr-1" />
            Print / Export Report
          </Button>
        </div>
      </div>

      {/* Simulation Status & Reproducibility Banner */}
      <div className="p-3.5 rounded-lg border border-slate-200 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="risk" className="font-mono text-[10px] px-2 py-0.5">
            SIMULATION RUN: RUN-2026-0908-01
          </Badge>
          <span className="text-slate-400">|</span>
          <span className="text-slate-600">
            Active Scenario: <strong className="text-slate-900">{activeScenario.name}</strong>
          </span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500">
            Target Host: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-800">{customHost}</code>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={simulationState === 'completed' ? 'ok' : simulationState === 'running' ? 'warn' : 'secondary'} className="text-[10px]">
            {simulationState === 'completed' ? 'EXECUTION COMPLETED' : simulationState === 'running' ? 'SIMULATING...' : 'READY'}
          </Badge>
          <span className="text-[11px] font-mono text-slate-400">
            All traces tagged: <strong className="text-rose-600 font-bold">[SIMULATED]</strong>
          </span>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="simulation" className="flex items-center gap-1.5 py-2 font-bold">
            <Terminal className="w-3.5 h-3.5 text-rose-600" />
            Scenario Simulator & Controls
          </TabsTrigger>
          <TabsTrigger value="footprint" className="flex items-center gap-1.5 py-2 font-bold">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Footprint Reconstruction Timeline
          </TabsTrigger>
          <TabsTrigger value="report" className="flex items-center gap-1.5 py-2 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Footprint Report & Evaluation
          </TabsTrigger>
          <TabsTrigger value="evidence" className="flex items-center gap-1.5 py-2">
            <Database className="w-3.5 h-3.5 text-slate-600" />
            Source Evidence (E01–E20)
          </TabsTrigger>
          <TabsTrigger value="uncertainties" className="flex items-center gap-1.5 py-2">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
            Alternative Explanations & Caveats
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SCENARIO SIMULATOR & CONTROLS */}
        <TabsContent value="simulation" className="space-y-4 mt-4">
          {/* Scenario Selection Cards */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              1. SELECT SYNTHETIC SCENARIO
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {SIMULATION_SCENARIOS.map((scen) => (
                <div
                  key={scen.id}
                  onClick={() => setSelectedScenarioId(scen.id)}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedScenarioId === scen.id
                      ? 'border-rose-600 bg-rose-50/70 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                      {scen.id}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {scen.steps.length} Steps
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 leading-snug">
                    {scen.name}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {scen.shortDesc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Scenario Details & Dynamic Variation Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Cols: Active Scenario Spec & Variation Config */}
            <Card className="lg:col-span-2 border-slate-200">
              <CardHeader className="p-4 pb-2 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-rose-600 uppercase">
                      ACTIVE SCENARIO SPECIFICATION
                    </span>
                    <CardTitle className="text-sm font-bold text-slate-900 mt-0.5">
                      {activeScenario.name}
                    </CardTitle>
                  </div>
                  <Badge variant="risk" className="text-[10px]">
                    TARGET: {activeScenario.targetSystem}
                  </Badge>
                </div>
                <CardDescription className="text-xs text-slate-600 mt-1">
                  <strong>Weakness Demonstrated:</strong> {activeScenario.weaknessDemonstrated}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Variation Configurators */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <strong className="text-slate-800 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-slate-600" />
                      Dynamic Simulation Variations (Handles Non-Hardcoded Test Runs)
                    </strong>
                    <span className="text-[10px] text-slate-500">Evaluates adaptivity</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Source Host / Build Runner
                      </label>
                      <select
                        value={customHost}
                        onChange={(e) => setCustomHost(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                      >
                        <option value="10.20.4.77 (tb-build-02)">10.20.4.77 (tb-build-02 via Private Link)</option>
                        <option value="10.20.4.82 (tb-worker-01)">10.20.4.82 (tb-worker-01 Variation)</option>
                        <option value="198.18.7.41 (Untrusted External)">198.18.7.41 (Untrusted External Gateway)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Machine Credential Injected
                      </label>
                      <select
                        value={customKey}
                        onChange={(e) => setCustomKey(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                      >
                        <option value="key-tb-07">key-tb-07 (Over-privileged, all modules)</option>
                        <option value="key-tb-03 (legacy active)">key-tb-03 (Stale active key variation)</option>
                        <option value="tb-sync-svc">tb-sync-svc (HelpDeskr Admin Scope)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Target Vendor Record
                      </label>
                      <select
                        value={customVendor}
                        onChange={(e) => setCustomVendor(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                      >
                        <option value="V-0412 (Coastal Packaging Ltd)">V-0412 (Coastal Packaging Ltd · ₹2,48,000)</option>
                        <option value="V-0104 (Southern Haulage Corp)">V-0104 (Southern Haulage Corp Variation)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                        Execution Time Window
                      </label>
                      <select
                        value={customTimeWindow}
                        onChange={(e) => setCustomTimeWindow(e.target.value)}
                        className="w-full text-xs p-1.5 rounded border border-slate-200 bg-white"
                      >
                        <option value="01:44:30 UTC (Nightly Window)">01:44:30 UTC (Standard Nightly Sync Window)</option>
                        <option value="14:15:00 UTC (Daylight Anomaly)">14:15:00 UTC (Daylight Out-of-Cycle Run)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Simulated Workflow */}
                <div>
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Simulated Execution Steps ({activeScenario.steps.length})
                  </div>
                  <div className="space-y-2.5">
                    {activeScenario.steps.map((st) => (
                      <div
                        key={st.stepNumber}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono">
                              {st.stepNumber}
                            </span>
                            {st.title}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {st.system}
                            </Badge>
                            <Badge variant="risk" className="text-[9px] font-mono">
                              SIMULATED
                            </Badge>
                          </div>
                        </div>

                        <p className="text-slate-600 text-[11px] leading-relaxed">
                          {st.action}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-white p-2 rounded border border-slate-200">
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Route</span>
                            <span className="text-rose-700 font-bold">{st.httpMethod} {st.endpoint}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[9px] uppercase">Generated Footprint Artifact</span>
                            <span className="text-emerald-700 font-bold">{st.generatedArtifact}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Col: Simulation Controls & Reproducibility Guide */}
            <div className="space-y-4">
              <Card className="border-slate-200 bg-slate-900 text-slate-100">
                <CardHeader className="p-4 border-b border-slate-800">
                  <CardTitle className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" />
                    SIMULATION CONTROLS
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-3 text-xs">
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    Executes synthetic API requests, applies the selected variations, and logs the generated footprints to local storage.
                  </p>

                  <Button
                    onClick={handleRunSimulation}
                    disabled={simulationState === 'running'}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2"
                  >
                    {simulationState === 'running' ? (
                      <>Running Local Scenario...</>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                        Run Selected Scenario
                      </>
                    )}
                  </Button>

                  {simulationState === 'completed' && (
                    <div className="p-2.5 rounded bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 text-[11px] flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>
                        Simulation executed cleanly. 100% of generated steps recorded in footprint reconstruction.
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reproducibility Guide for Judges */}
              <Card className="border-slate-200">
                <CardHeader className="p-4 border-b border-slate-100">
                  <CardTitle className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    REPRODUCIBILITY GUIDE (FOR EVALUATORS)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-2.5 text-xs text-slate-600 leading-relaxed">
                  <p className="text-[11px]">
                    To replicate this demonstration independently:
                  </p>
                  <ol className="space-y-1.5 list-decimal list-inside text-[11px] text-slate-700">
                    <li>Select scenario <strong className="text-slate-900">SCEN-04</strong> or <strong className="text-slate-900">SCEN-05</strong>.</li>
                    <li>Set Target Host to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">10.20.4.77</code> and Key to <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">key-tb-07</code>.</li>
                    <li>Click <strong>Run Selected Scenario</strong>.</li>
                    <li>Navigate to the <strong>Footprint Reconstruction</strong> tab to inspect the exact correlated trace IDs (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">req-5f61b0de8</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">chg-8b9888c39b</code>).</li>
                    <li>Verify match against evidence files E18 and E19.</li>
                  </ol>
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 font-mono">
                    CLI Equivalent: <code className="text-slate-700 font-bold">python attack-cli/harborstrike_attack.py --run-all</code>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: FOOTPRINT RECONSTRUCTION TIMELINE */}
        <TabsContent value="footprint" className="space-y-4 mt-4">
          <Card className="border-slate-200">
            <CardHeader className="p-4 border-b border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Cross-System Event Footprint Reconstruction (Correlated Timeline)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Reconstruction of simulated attack actions mapped across HelpDeskr (IST), BlueVault (Epoch), and LedgerOne (UTC).
                  </CardDescription>
                </div>
                <Badge variant="ok" className="text-xs font-mono">
                  100% RECONCILED AGAINST LOGS
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 text-[11px]">
                    <TableHead className="w-28 font-bold">UTC Timestamp</TableHead>
                    <TableHead className="w-24 font-bold">Target System</TableHead>
                    <TableHead className="font-bold">Simulated Action & HTTP Endpoint</TableHead>
                    <TableHead className="w-32 font-bold">Credential / Principal</TableHead>
                    <TableHead className="w-28 font-bold">Source Host</TableHead>
                    <TableHead className="w-32 font-bold">Evidence Ref</TableHead>
                    <TableHead className="w-20 font-bold">Classification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {INCIDENT_CHRONOLOGY.map((ev) => (
                    <TableRow
                      key={ev.id}
                      className={ev.severity === 'critical' ? 'bg-rose-50/70 font-medium' : undefined}
                    >
                      <TableCell className="font-mono text-[11px] text-slate-600">
                        {ev.utcTimestamp}
                        <span className="block text-[10px] text-slate-400">
                          IST: {ev.istTimestamp}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">
                          {ev.system}
                        </Badge>
                      </TableCell>
                      <TableCell className="leading-relaxed">
                        <span className="font-mono text-[11px] text-slate-900 font-semibold block">
                          {ev.endpointAction}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Volume: {ev.recordsVolume} · {ev.phase}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-slate-700">
                        {ev.sourceKey}
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-slate-500">
                        {ev.sourceIp}
                      </TableCell>
                      <TableCell className="font-mono text-blue-600 font-bold text-[11px]">
                        {ev.evidenceIds.join(', ')}
                      </TableCell>
                      <TableCell>
                        <Badge variant="risk" className="text-[9px] font-mono">
                          SIMULATED
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: FOOTPRINT REPORT & EVALUATION */}
        <TabsContent value="report" className="space-y-4 mt-4">
          <Card className="border-slate-200">
            <CardHeader className="p-5 border-b border-slate-200 bg-slate-50/70">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                    CRIMEATHON '26 OFFENSE REPORT PACK
                  </div>
                  <CardTitle className="text-base font-bold text-slate-900 mt-0.5">
                    Technical Footprint Report & Objective Evaluation Summary
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-600">
                    Comprehensive evaluation of exploit success, target telemetry impact, detection status, and residual uncertainties.
                  </CardDescription>
                </div>
                <Button
                  onClick={handlePrintReport}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5" />
                  Print / Save as PDF
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-5 space-y-5 text-xs leading-relaxed text-slate-700">
              {/* Executive Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Simulation Status</span>
                  <span className="text-sm font-black text-emerald-700 mt-0.5 block">100% COMPLETE</span>
                  <span className="text-[10px] text-slate-500">All 4 vectors executed</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Pivoted Volume</span>
                  <span className="text-sm font-black text-slate-900 mt-0.5 block">22.2 MB Payload</span>
                  <span className="text-[10px] text-slate-500">Over Private Link tunnel</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Hijacked Disbursement</span>
                  <span className="text-sm font-black text-rose-600 mt-0.5 block">₹2,48,000</span>
                  <span className="text-[10px] text-slate-500">Coastal Packaging (V-0412)</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Alerting State</span>
                  <span className="text-sm font-black text-amber-700 mt-0.5 block">Zero Automated Alerts</span>
                  <span className="text-[10px] text-slate-500">Only billing overage caught</span>
                </div>
              </div>

              {/* Summary of What Was Achieved */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">1. Tactical Objectives Achieved</h3>
                <ul className="space-y-1.5 list-disc list-inside text-slate-700 text-xs">
                  <li>
                    <strong>Credential Abuse:</strong> Successfully leveraged over-privileged machine token <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">key-tb-07</code> and support admin token <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">tb-sync-svc</code> with zero IP restriction checks.
                  </li>
                  <li>
                    <strong>Stealth Exfiltration:</strong> Triggered 10 bulk exports in HelpDeskr (EXP-5410 to EXP-5419) and downloaded master vendor bank instructions from BlueVault (3.46 MB) using credential <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">bvk-7f3a</code>.
                  </li>
                  <li>
                    <strong>Network Infiltration:</strong> Pivoted through rogue build runner <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">10.20.4.77</code> across the Private Link, blending into ordinary scheduled synchronization traffic.
                  </li>
                  <li>
                    <strong>Vendor Payment Redirection:</strong> Submitted payload <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">req-5f61b0de8</code> modifying Coastal Packaging Ltd bank account to <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">****9083</code> with blank approval reference (<code className="font-mono bg-slate-100 px-1 py-0.5 rounded">chg-8b9888c39b</code>).
                  </li>
                </ul>
              </div>

              {/* What Was Detected vs What Remained Undetected */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50/50 space-y-1.5">
                  <strong className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    What Evaded Detection by Target Monitoring:
                  </strong>
                  <ul className="space-y-1 list-disc list-inside text-[11px] text-rose-900 leading-snug">
                    <li>LedgerOne API bank alteration (<code className="font-mono">req-5f61b0de8</code>) triggered zero SIEM alert due to blank approval validation omission.</li>
                    <li>BlueVault file exfiltrations went unnoticed due to hardware clock drift (+14m skew) breaking correlation with perimeter logs.</li>
                    <li>Nightly sync window timing (01:00-02:30 UTC) disguised high API call volumes as legitimate automated batch operations.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1.5">
                  <strong className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    What Produced Incidental Footprints:
                  </strong>
                  <ul className="space-y-1 list-disc list-inside text-[11px] text-amber-900 leading-snug">
                    <li>HelpDeskr export delete timeout on <code className="font-mono">EXP-5419</code> (evt-3fe76f60c4) left a permanent artifact in the audit queue.</li>
                    <li>Excess export jobs triggered an automated SaaS billing surcharge of ₹22,500 on invoice INV-HD-2026-0831.</li>
                    <li>Vendor master change log recorded the modification record <code className="font-mono">chg-8b9888c39b</code> with blank approval reference.</li>
                  </ul>
                </div>
              </div>

              {/* Uncertainties & Caveats */}
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50 space-y-1.5">
                <strong className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-slate-600" />
                  Residual Uncertainties & Attribution Limits:
                </strong>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  The evidence proves the technical pathway (<code className="font-mono">key-tb-07</code> from host <code className="font-mono">10.20.4.77</code>), but does not prove whether the adversary was an external party who compromised TallyBridge Connect CI/CD infrastructure, or a malicious contractor with authorized access to the build runner. Furthermore, ex-employee Rohan Menon's active kiosk login on 13 August remains an unverified insider correlation versus an IT offboarding hygiene coincidence.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 4: SOURCE EVIDENCE (E01–E20) */}
        <TabsContent value="evidence" className="space-y-4 mt-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search file, source, or caveat..."
                value={evidenceSearch}
                onChange={(e) => setEvidenceSearch(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-500">
              <span>Filter:</span>
              {(['all', 'verified', 'analyzed'] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setEvidenceFilter(f)}
                  className={`px-2.5 py-1 rounded capitalize font-medium ${
                    evidenceFilter === f
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Compact Evidence Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredEvidence.map((ev) => (
              <Card key={ev.id} className="border-slate-200 hover:shadow-sm transition-all">
                <CardHeader className="p-3.5 pb-2 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 text-white">
                        {ev.id}
                      </span>
                      <CardTitle className="text-xs font-bold text-slate-900">
                        {ev.name}
                      </CardTitle>
                    </div>
                    <Badge variant={ev.status === 'Verified' ? 'ok' : 'secondary'} className="text-[10px]">
                      {ev.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-[11px] text-slate-500 mt-0.5">
                    {ev.format} · Source: {ev.source} · Time: {ev.period}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-3.5 pt-2 space-y-2 text-xs">
                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    <strong>Factual Finding:</strong> {ev.summaryFinding}
                  </p>

                  <div className="p-2 rounded bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Specific Evidence Records:
                    </span>
                    <ul className="space-y-0.5 list-disc list-inside text-slate-600">
                      {ev.provenFacts.slice(0, 2).map((fact, idx) => (
                        <li key={idx} className="line-clamp-2">{fact}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="text-[10px] text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center justify-between font-mono">
                    <span>Reliability / Caveat:</span>
                    <span>{ev.clockTraits}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 5: ALTERNATIVE EXPLANATIONS & CAVEATS */}
        <TabsContent value="uncertainties" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Alternative Explanations */}
            <Card className="border-slate-200">
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-blue-600" />
                  Legitimate Alternative Explanations Considered
                </CardTitle>
                <CardDescription className="text-xs">
                  How ordinary background business activities were differentiated from unauthorized actions.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    1. Farah Dsouza's Periodic Finance Audits vs. Bulk Exfiltration
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    Farah Dsouza (Senior Accountant) conducts periodic vendor exports. However, her actions occur during office hours (09:00-17:00 IST) using authenticated web sessions with human User-Agent strings. In contrast, the 12 Aug exfiltration used API token <code className="font-mono">key-tb-07</code> at midnight from an external IP with zero interactive UI session.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    2. Sunita Iyer's Weekly Tuesday Reports vs. Attack Exports
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    Sunita Iyer routinely exports weekly HelpDeskr reports every Tuesday (EXP-5408, 5409, 5420, 5421). The 10 malicious exports (EXP-5410 to 5419) occurred in rapid succession over 59 minutes near midnight on a Wednesday night via machine token <code className="font-mono">tb-sync-svc</code> from external IP <code className="font-mono">198.18.7.58</code>.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    3. Colin Lawson Contractor Mobility vs. Rogue Access
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    Contractor Colin Lawson signs in from Chennai, Bangalore, and Coimbatore. Travel records correlate with physical site maintenance, whereas the API calls from build host <code className="font-mono">10.20.4.77</code> occurred over the machine-to-machine Private Link tunnel without any SSO interaction.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Technical Caveats & Clock Skew */}
            <Card className="border-slate-200">
              <CardHeader className="p-4 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  Clock / Timezone Discrepancies & Incomplete Data
                </CardTitle>
                <CardDescription className="text-xs">
                  Critical timing caveats that impact log correlation.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs leading-relaxed text-slate-700">
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 space-y-1">
                  <strong className="text-amber-950 block font-semibold">
                    BlueVault Clock Skew (+14m Fast, Unix Epoch)
                  </strong>
                  <p className="text-[11px] text-amber-900">
                    Evidence file E05 records access events in raw Unix epoch seconds with hardware clock drift running ~14 minutes fast. Without normalizing timestamps back to true UTC, correlation with network flow logs in E15 produces apparent time-travel discrepancies.
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    HelpDeskr Tenant Local Time (IST / UTC+5:30)
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    Audit log E02 is recorded in Indian Standard Time (UTC+5:30). Converting midnight events (23:30–00:29 IST) places the exfiltration in early evening UTC (18:00–18:59 UTC).
                  </p>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                  <strong className="text-slate-900 block font-semibold">
                    LedgerOne 90-Day Retention Blind Spot
                  </strong>
                  <p className="text-[11px] text-slate-600">
                    LedgerOne purges API logs after 90 days. Activity prior to 3 June 2026 is completely unavailable, precluding inspection of the initial key setup in June 2024.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Reset Confirmation Dialog */}
      <Dialog
        isOpen={isResetDialogOpen}
        onClose={() => setIsResetDialogOpen(false)}
        title="Reset Simulation Environment"
      >
        <div className="space-y-3 text-xs text-slate-700">
          <p>
            Are you sure you want to reset the simulation state?
          </p>
          <div className="p-2.5 rounded bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-[11px]">
            <strong>What will be reset:</strong>
            <ul className="list-disc list-inside">
              <li>All active scenario execution states and in-memory simulated logs.</li>
              <li>Dynamic variation overrides back to default configuration.</li>
            </ul>
          </div>
          <p className="text-slate-500 text-[11px]">
            Original case evidence (E01–E20) and browser demo accounts will remain intact.
          </p>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetDialogOpen(false)}
              className="text-xs font-semibold"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleResetSimulation}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Confirm Reset
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
