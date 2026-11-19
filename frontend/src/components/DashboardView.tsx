import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PageId } from '../types';
import { APPS } from '../data/mockData';
import {
  CASE_METADATA,
  OFFENSIVE_ATTACK_VECTORS,
  OFFENSIVE_KILLCHAIN_PHASES,
  ATTACK_FOOTPRINT_VERIFICATION,
} from '../data/caseEvidenceData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import {
  Flame,
  Zap,
  ArrowRight,
  Terminal,
  ShieldCheck,
  Building2,
  Key,
  Layers,
  Database,
  Crosshair,
  Play,
  RotateCcw,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate?: (page: PageId) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const navigate = useNavigate();
  const [selectedVectorIndex, setSelectedVectorIndex] = useState(0);
  const [simulatedExecutionState, setSimulatedExecutionState] = useState<'idle' | 'running' | 'success'>('idle');

  const routeMap: Record<Exclude<PageId, 'dashboard'>, string> = {
    help: '/helpdeskr',
    blue: '/bluevault',
    ledger: '/ledgerone',
    tally: '/tallybridge',
    evidence: '/evidence',
  };

  const handleModuleClick = (appId: Exclude<PageId, 'dashboard'>) => {
    if (onNavigate) {
      onNavigate(appId);
    }
    navigate(routeMap[appId]);
  };

  const currentVector = OFFENSIVE_ATTACK_VECTORS[selectedVectorIndex] || OFFENSIVE_ATTACK_VECTORS[0];

  const handleRunSimulatedExploit = () => {
    setSimulatedExecutionState('running');
    setTimeout(() => {
      setSimulatedExecutionState('success');
    }, 600);
  };

  const stats = [
    {
      label: 'Hijacked Disbursement',
      value: '₹2,48,000',
      sub: 'Target: Coastal Packaging (V-0412)',
      icon: Flame,
      variant: 'risk' as const,
    },
    {
      label: 'Compromised Machine Keys',
      value: '3 Keys',
      sub: 'key-tb-07, tb-sync-svc, bvk-7f3a',
      icon: Key,
      variant: 'risk' as const,
    },
    {
      label: 'Exfiltrated Support Jobs',
      value: '10 Bulk Runs',
      sub: 'EXP-5410 to EXP-5419 (HelpDeskr)',
      icon: Database,
      variant: 'warn' as const,
    },
    {
      label: 'Footprint Verification',
      value: '100% Match',
      sub: 'E01, E02, E05, E15, E18, E19 logs',
      icon: ShieldCheck,
      variant: 'ok' as const,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold tracking-widest text-rose-600 uppercase mb-1 flex items-center gap-1.5">
            <Crosshair className="w-3.5 h-3.5" />
            OPERATION HARBORSTRIKE · RED TEAM CONSOLE
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Offensive Attack Simulation & Exploit Execution
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Target Organization: <span className="font-semibold text-slate-700">{CASE_METADATA.targetCompany}</span> (Case {CASE_METADATA.caseId}) · Multi-vector exploit verification against supply-chain weaknesses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="risk" className="text-xs py-1 px-2.5 font-bold">
            <Zap className="w-3.5 h-3.5 mr-1" />
            ATTACK MODE: ARMED & VERIFIED
          </Badge>
          <Button
            onClick={() => navigate('/evidence')}
            className="bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs"
          >
            <Zap className="w-3.5 h-3.5 mr-1.5" />
            Exploit Vectors & Payloads
          </Button>
        </div>
      </div>

      {/* Primary Offensive Target Banner */}
      <Alert className="border-rose-400/80 bg-gradient-to-r from-rose-950 to-slate-900 text-white shadow-md">
        <Flame className="h-6 w-6 text-rose-400 shrink-0 mt-0.5" />
        <div className="ml-2 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-black tracking-wide text-rose-300 uppercase flex items-center gap-2">
              <span>PRIMARY EXPLOIT: SILENT FINANCIAL DISBURSEMENT HIJACK</span>
              <span className="text-[10px] bg-rose-600 text-white font-mono px-2 py-0.5 rounded font-bold">
                PAYOUT DATE: 08 SEP 2026
              </span>
            </h2>
            <Badge variant="risk" className="bg-rose-600 text-white text-[10px]">
              VULNERABILITY: UNVALIDATED API PATCH
            </Badge>
          </div>
          <AlertDescription className="text-xs text-slate-200 mt-2 leading-relaxed">
            Target Victim: <strong className="text-white font-bold">Coastal Packaging Ltd (Vendor ID: V-0412)</strong> · Scheduled Disbursement: <strong className="text-amber-300 font-mono text-sm font-bold">₹2,48,000</strong> on Invoice <span className="font-mono text-white">INV-9081</span>.
            <br />
            Exploit Execution: On 03 September at 01:44:30 UTC, rogue build server <code className="font-mono bg-rose-900/80 text-rose-200 px-1.5 py-0.5 rounded">10.20.4.77</code> used hijacked machine key <code className="font-mono bg-rose-900/80 text-rose-200 px-1.5 py-0.5 rounded">key-tb-07</code> to patch genuine bank account <code className="font-mono text-slate-300">****4417</code> to adversary beneficiary account <code className="font-mono text-emerald-300 font-bold">****9083</code> with a blank approval reference. Payment is primed for automated capture.
          </AlertDescription>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => navigate('/ledgerone')}
              className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white"
            >
              Inspect LedgerOne Target <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedVectorIndex(0)}
              className="text-xs font-bold border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
              Load Vector Payload in Exploit Runner
            </Button>
          </div>
        </div>
      </Alert>

      {/* KPI Stats Grid with shadcn Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => {
          const IconComponent = s.icon;
          return (
            <Card key={idx} className="relative overflow-hidden border-slate-200 hover:border-slate-300 transition-all">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                  <span className="p-2 bg-rose-50 text-rose-600 rounded-lg">
                    <IconComponent className="w-4 h-4" />
                  </span>
                </div>
                <div className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
                  {s.value}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  {s.sub}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Interactive Exploit Runner / Strike Simulator */}
      <Card className="border-slate-300 bg-slate-900 text-slate-100 shadow-md">
        <CardHeader className="p-5 border-b border-slate-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                INTERACTIVE EXPLOIT EXECUTION CONSOLE
              </div>
              <CardTitle className="text-base font-bold text-white mt-1">
                Weaponized Attack Vector Simulation & Footprint Verification
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Select an attack vector to simulate payload delivery against target endpoints and observe the exact footprint generated.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleRunSimulatedExploit}
                disabled={simulatedExecutionState === 'running'}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                {simulatedExecutionState === 'running' ? (
                  <>Simulating Execution...</>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                    Simulate Exploit Attack
                  </>
                )}
              </Button>
              {simulatedExecutionState === 'success' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSimulatedExecutionState('idle')}
                  className="border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* Vector Selector Pills */}
          <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-800">
            {OFFENSIVE_ATTACK_VECTORS.map((vec, idx) => (
              <button
                key={vec.id}
                type="button"
                onClick={() => {
                  setSelectedVectorIndex(idx);
                  setSimulatedExecutionState('idle');
                }}
                className={`text-xs font-mono px-3 py-1.5 rounded-md transition-all flex items-center gap-2 ${
                  selectedVectorIndex === idx
                    ? 'bg-rose-600 text-white font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span className="text-[10px] opacity-80">{vec.id}</span>
                <span>{vec.name.split('(')[0].trim()}</span>
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Vector Specs */}
            <div className="space-y-3 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 font-mono">{currentVector.id} · {currentVector.category}</span>
                <Badge variant="risk" className="text-[10px]">{currentVector.severity}</Badge>
              </div>
              <div className="text-sm font-bold text-white">{currentVector.name}</div>
              <p className="text-xs text-slate-300 leading-relaxed">{currentVector.payloadSummary}</p>

              <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Target System</span>
                  <span className="text-slate-200 font-medium">{currentVector.targetSystem}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Compromised Key</span>
                  <span className="text-rose-400 font-mono font-medium">{currentVector.exploitedKey}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Source Host</span>
                  <span className="text-slate-200 font-mono font-medium">{currentVector.sourceHost}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Execution Window</span>
                  <span className="text-slate-200 font-mono font-medium">{currentVector.executionTimestamp}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Control Weakness Exploited</span>
                <p className="text-amber-300/90 text-[11px] mt-0.5">{currentVector.targetVulnerability}</p>
              </div>
            </div>

            {/* Simulated Terminal & Payload */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  TERMINAL PAYLOAD DISPATCH
                </span>
                <span className="text-slate-500">Method: {currentVector.httpMethod}</span>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Simulated Execution Command</span>
                <pre className="mt-1 p-2 bg-slate-900 rounded text-emerald-400 text-[11px] overflow-x-auto leading-relaxed border border-slate-800">
                  {currentVector.simulatedCurlCommand}
                </pre>
              </div>

              <div>
                <span className="text-[10px] text-slate-500 block uppercase font-bold">Target Footprint Artifact Generated</span>
                <div className="mt-1 p-2 bg-slate-900/90 rounded text-slate-200 text-[11px] border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-rose-400 font-bold">{currentVector.footprintRecordId}</span>
                    <span className="text-slate-400 block text-[10px] mt-0.5">Evidence cross-ref: {currentVector.evidenceRef}</span>
                  </div>
                  <Badge variant="ok" className="text-[10px]">Verified in Logs</Badge>
                </div>
              </div>

              {simulatedExecutionState === 'success' && (
                <div className="p-2.5 bg-emerald-950/70 border border-emerald-700/60 rounded text-emerald-300 text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Exploit executed successfully. Trace verified in target audit log with zero alarm raised.
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Business Systems Grid */}
      <div>
        <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3 flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5" />
          TARGET ENVIRONMENT & COMPROMISED ATTACK SURFACES
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.values(APPS).map((app) => (
            <Card
              key={app.id}
              onClick={() => handleModuleClick(app.id as Exclude<PageId, 'dashboard'>)}
              className="cursor-pointer transition-all hover:shadow-md hover:border-slate-400 group border-slate-200"
            >
              <CardHeader className="p-4 pb-2 border-b-0">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-rose-50 group-hover:text-rose-600 transition-colors flex items-center justify-center font-bold text-base text-slate-700">
                    {app.icon}
                  </div>
                  <Badge variant="risk" className="text-[10px]">
                    Exploited
                  </Badge>
                </div>
                <CardTitle className="text-sm font-bold text-slate-900 mt-2 group-hover:text-rose-600 transition-colors">
                  {app.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                  {app.desc}
                </p>
                <div className="text-xs font-bold text-rose-600 mt-3 flex items-center gap-1">
                  Inspect attack surface <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Attack Kill Chain & Footprint Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Kill Chain */}
        <Card className="border-slate-200">
          <CardHeader className="p-4">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-rose-600" />
              Adversary Kill Chain Progress
            </CardTitle>
            <CardDescription className="text-xs">
              4 distinct execution stages from initial credential harvest to high-value payout diversion.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-3">
            {OFFENSIVE_KILLCHAIN_PHASES.map((phase) => (
              <div
                key={phase.phaseNumber}
                className="p-3 rounded-lg border border-slate-200 bg-slate-50/70 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    Stage {phase.phaseNumber}: {phase.phaseName}
                  </span>
                  <Badge variant={phase.detectionStatus === 'Undetected' ? 'risk' : 'warn'} className="text-[10px]">
                    {phase.detectionStatus}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  {phase.keyAction}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1">
                  <span>{phase.timeWindow}</span>
                  <span className="text-emerald-700 font-bold">{phase.outcome}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Footprint Log Match */}
        <Card className="border-slate-200">
          <CardHeader className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Attack Footprint Verification Report
                </CardTitle>
                <CardDescription className="text-xs">
                  Correlated traces produced in target logs, proving 100% footprint accuracy.
                </CardDescription>
              </div>
              <Badge variant="ok" className="text-xs font-mono">100% Log Match</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 divide-y divide-slate-100">
            {ATTACK_FOOTPRINT_VERIFICATION.map((fp) => (
              <div key={fp.id} className="py-2.5 first:pt-0 last:pb-0 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="font-mono text-rose-600">{fp.id}</span>
                    <span>{fp.sourceSystem}</span>
                  </span>
                  <span className="text-[10px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                    {fp.systemClock}
                  </span>
                </div>
                <div className="text-xs font-mono text-slate-800 bg-slate-50 p-1 rounded border border-slate-100">
                  {fp.httpDetails}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Record: <strong className="text-slate-700 font-mono">{fp.recordIdentifier}</strong></span>
                  <span className="text-emerald-700 font-medium">{fp.verifiedInEvidence}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
