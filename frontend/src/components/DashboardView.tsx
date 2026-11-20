import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { ArrowRight, Clock, ShieldCheck, CheckCircle2, Server, Terminal, AlertCircle } from 'lucide-react';
import { checkBackendHealth } from '../services/api';

export interface StoredSimulationRun {
  runId: string;
  timestamp: string;
  status: 'Completed' | 'Failed' | 'Running';
  scenarioId: string;
  scenarioName: string;
  targetSystem: string;
  stepsCount: number;
  footprintCount: number;
  verificationStatus: 'Verified' | 'Unverified' | 'Failed';
  executionTimeMs: number;
}

export function DashboardView() {
  const navigate = useNavigate();
  const [runs] = useState<StoredSimulationRun[]>(() => {
    try {
      const stored = localStorage.getItem('hsSimulationRuns');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [backendUp, setBackendUp] = useState<boolean | null>(null);

  useEffect(() => {
    // Check actual backend health
    checkBackendHealth()
      .then((ok) => setBackendUp(ok))
      .catch(() => setBackendUp(false));
  }, []);

  const latestRun = runs.length > 0 ? runs[0] : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Page Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">Investigation overview</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-mono bg-white text-slate-700">
            Case CR-26-047
          </Badge>
          <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
            Local simulation
          </Badge>
        </div>
      </div>

      {/* 2. Investigation Identity & Environment Notice */}
      <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Target Organization
          </div>
          <div className="text-base font-semibold text-slate-900">
            Harbor & Finch Freight Pvt. Ltd.
          </div>
          <div className="text-xs text-slate-500">
            Case Reference: <span className="font-mono font-medium text-slate-700">CR-26-047</span> · Chennai, Coimbatore & Madurai Depots
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-slate-400" />
            Backend Service:{' '}
            <span className="font-medium text-slate-700">
              {backendUp === null ? (
                'Checking...'
              ) : backendUp ? (
                <span className="text-emerald-700 font-semibold">Connected (API online)</span>
              ) : (
                <span className="text-slate-600">Local simulation mode</span>
              )}
            </span>
          </div>

          <Button
            onClick={() => navigate('/evidence')}
            className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs px-4 py-2"
          >
            Open Exploit Workspace
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>

      {/* 3. Compact Status Area */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Simulation State */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <CardDescription className="text-[11px] uppercase font-semibold text-slate-500">
              Simulation Status
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <div className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              {latestRun ? (
                latestRun.status === 'Completed' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Completed</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>Failed</span>
                  </>
                )
              ) : (
                <span className="text-slate-500 text-sm font-normal">Not started</span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {latestRun ? `Scenario: ${latestRun.scenarioId}` : 'Ready to execute'}
            </div>
          </CardContent>
        </Card>

        {/* Last Run ID */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <CardDescription className="text-[11px] uppercase font-semibold text-slate-500">
              Last Run Identifier
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <div className="text-base font-bold font-mono text-slate-900">
              {latestRun ? latestRun.runId : '—'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {latestRun ? latestRun.timestamp : 'No simulation run yet'}
            </div>
          </CardContent>
        </Card>

        {/* Generated Footprints */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <CardDescription className="text-[11px] uppercase font-semibold text-slate-500">
              Footprint Events
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <div className="text-base font-bold text-slate-900">
              {latestRun ? `${latestRun.footprintCount} recorded` : '0'}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {latestRun ? `${latestRun.stepsCount} execution steps` : 'No events generated'}
            </div>
          </CardContent>
        </Card>

        {/* Verification Status */}
        <Card className="border-slate-200 shadow-xs">
          <CardHeader className="p-3.5 pb-1">
            <CardDescription className="text-[11px] uppercase font-semibold text-slate-500">
              Footprint Verification
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3.5 pt-1">
            <div className="text-base font-bold flex items-center gap-1.5">
              {latestRun ? (
                latestRun.verificationStatus === 'Verified' ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Verified
                  </span>
                ) : (
                  <span className="text-amber-700">Unverified</span>
                )
              ) : (
                <span className="text-slate-500 text-sm font-normal">Pending run</span>
              )}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {latestRun ? 'Cross-checked with E01-E19' : 'Requires execution'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Recent Execution Summary (Real History Only) */}
      <Card className="border-slate-200 shadow-xs">
        <CardHeader className="p-4 pb-2 border-b border-slate-100 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              Recent Execution History
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Log of controlled simulation runs recorded in this session.
            </CardDescription>
          </div>
          {runs.length > 0 && (
            <span className="text-xs font-mono text-slate-500">
              {runs.length} run{runs.length > 1 ? 's' : ''}
            </span>
          )}
        </CardHeader>

        <CardContent className="p-0">
          {runs.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <div className="text-xs text-slate-500">No simulation runs executed yet.</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Navigate to the Exploit Workspace to configure scenario parameters and execute the controlled attack simulation.
              </p>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/evidence')}
                  className="text-xs border-slate-300 text-slate-700"
                >
                  <Terminal className="w-3.5 h-3.5 mr-1 text-slate-500" />
                  Go to Exploit & Attack Vectors
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[11px] text-slate-500 uppercase font-semibold border-b border-slate-100">
                  <tr>
                    <th className="p-3 pl-4">Run ID</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Scenario</th>
                    <th className="p-3">Target System</th>
                    <th className="p-3">Footprints</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 pr-4 text-right">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {runs.slice(0, 5).map((r) => (
                    <tr key={r.runId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3 pl-4 font-mono font-semibold text-slate-800">
                        {r.runId}
                      </td>
                      <td className="p-3 text-slate-500">{r.timestamp}</td>
                      <td className="p-3 font-medium text-slate-700">{r.scenarioName}</td>
                      <td className="p-3 text-slate-600">{r.targetSystem}</td>
                      <td className="p-3 font-mono text-slate-700">{r.footprintCount} events</td>
                      <td className="p-3">
                        <Badge
                          variant={r.status === 'Completed' ? 'ok' : 'risk'}
                          className="text-[10px]"
                        >
                          {r.status}
                        </Badge>
                      </td>
                      <td className="p-3 pr-4 text-right font-medium">
                        {r.verificationStatus === 'Verified' ? (
                          <span className="text-emerald-700 font-semibold text-[11px]">
                            Verified
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Unverified</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
