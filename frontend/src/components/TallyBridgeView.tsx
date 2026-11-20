import { useState, useEffect, useCallback } from 'react';
import type { KeyRecord, SyncJobRecord } from '../types';
import { APPS } from '../data/mockData';
import { FORENSIC_API_LOGS } from '../data/caseEvidenceData';
import {
  tallybridgeApi,
  converters,
  type ServiceAccountDto,
  type ConnectedAppDto,
  type PermissionReviewDto,
  type NetworkFlowDto,
  type ApiActivityItem,
} from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
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
  Cpu,
  Key,
  Users,
  Layers,
  Server,
  Network,
  ShieldCheck,
  Sliders,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Plus,
  Trash2,
} from 'lucide-react';

interface TallyBridgeViewProps {
  keys: KeyRecord[];
  jobs: SyncJobRecord[];
  onAddKey: (key: KeyRecord) => void;
  onDeleteKey?: (keyId: string) => void;
  onRunSync: (job: SyncJobRecord) => void;
  onDeleteSyncJob?: (jobId: string) => void;
  showMessage: (msg: string) => void;
}

export function TallyBridgeView({
  keys,
  jobs,
  onAddKey,
  onDeleteKey,
  onRunSync,
  onDeleteSyncJob,
  showMessage,
}: TallyBridgeViewProps) {
  const [activeTab, setActiveTab] = useState('keys');

  // Live state from backend
  const [liveKeys, setLiveKeys] = useState<KeyRecord[]>(keys);
  const [liveJobs, setLiveJobs] = useState<SyncJobRecord[]>(jobs);
  const [liveAccounts, setLiveAccounts] = useState<ServiceAccountDto[]>([]);
  const [liveApps, setLiveApps] = useState<ConnectedAppDto[]>([]);
  const [livePerms, setLivePerms] = useState<PermissionReviewDto[]>([]);
  const [liveFlows, setLiveFlows] = useState<NetworkFlowDto[]>([]);
  const [liveActivity, setLiveActivity] = useState<ApiActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Create API Key modal
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [keyOwner, setKeyOwner] = useState('');
  const [keyScope, setKeyScope] = useState('read:write all-modules');
  const [keyExpiry, setKeyExpiry] = useState('90 days');
  const [keyIp, setKeyIp] = useState('10.20.4.0/24');

  // Service accounts modal
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountTeam, setAccountTeam] = useState('IT Operations');
  const [accountPurpose, setAccountPurpose] = useState('Database replication');

  // Connected apps modal
  const [isConnectAppOpen, setIsConnectAppOpen] = useState(false);
  const [appName, setAppName] = useState('');
  const [appEnv, setAppEnv] = useState('Simulated');

  // Token & IP Controls
  const [tokenLifetime, setTokenLifetime] = useState('90 days');
  const [ipAllowlist, setIpAllowlist] = useState('10.20.4.0/24');

  // Build Host config
  const [hostLabel, setHostLabel] = useState('tb-build-02');
  const [hostEnv, setHostEnv] = useState('Private Link (10.20.4.77)');

  // Async data fetch on mount
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      tallybridgeApi.getKeys(),
      tallybridgeApi.getSyncJobs(),
      tallybridgeApi.getServiceAccounts(),
      tallybridgeApi.getConnectedApps(),
      tallybridgeApi.getPermissions(),
      tallybridgeApi.getNetworkFlows(),
      tallybridgeApi.getApiActivity(),
    ]).then(([kRes, jRes, aRes, apRes, pRes, fRes, actRes]) => {
      if (!active) return;
      if (kRes.status === 'fulfilled' && kRes.value.length > 0) {
        setLiveKeys(kRes.value.map(converters.keyToRecord));
      }
      if (jRes.status === 'fulfilled' && jRes.value.length > 0) {
        setLiveJobs(jRes.value.map(converters.syncJobToRecord));
      }
      if (aRes.status === 'fulfilled') setLiveAccounts(aRes.value);
      if (apRes.status === 'fulfilled') setLiveApps(apRes.value);
      if (pRes.status === 'fulfilled') setLivePerms(pRes.value);
      if (fRes.status === 'fulfilled') setLiveFlows(fRes.value);
      if (actRes.status === 'fulfilled') setLiveActivity(actRes.value);
    });
    return () => {
      active = false;
    };
  }, []);

  // Manual DB sync
  const loadTallyData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [kRes, jRes, aRes, apRes, pRes, fRes, actRes] = await Promise.allSettled([
        tallybridgeApi.getKeys(),
        tallybridgeApi.getSyncJobs(),
        tallybridgeApi.getServiceAccounts(),
        tallybridgeApi.getConnectedApps(),
        tallybridgeApi.getPermissions(),
        tallybridgeApi.getNetworkFlows(),
        tallybridgeApi.getApiActivity(),
      ]);

      if (kRes.status === 'fulfilled' && kRes.value.length > 0) {
        setLiveKeys(kRes.value.map(converters.keyToRecord));
      }
      if (jRes.status === 'fulfilled' && jRes.value.length > 0) {
        setLiveJobs(jRes.value.map(converters.syncJobToRecord));
      }
      if (aRes.status === 'fulfilled') setLiveAccounts(aRes.value);
      if (apRes.status === 'fulfilled') setLiveApps(apRes.value);
      if (pRes.status === 'fulfilled') setLivePerms(pRes.value);
      if (fRes.status === 'fulfilled') setLiveFlows(fRes.value);
      if (actRes.status === 'fulfilled') setLiveActivity(actRes.value);
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. CREATE API KEY
  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyOwner.trim()) {
      showMessage('Key owner is required.');
      return;
    }
    const fallbackId = `key-tb-${Math.floor(10 + Math.random() * 90)}`;
    const newRecord: KeyRecord = [
      fallbackId,
      keyOwner.trim(),
      keyScope,
      keyExpiry,
      keyIp || 'Not restricted',
      'Active',
    ];

    try {
      const created = await tallybridgeApi.createKey({
        owner: keyOwner.trim(),
        scope: keyScope,
        expiry: keyExpiry,
        ip_restrict: keyIp || 'Not restricted',
      });
      const rec = converters.keyToRecord(created);
      onAddKey(rec);
      setLiveKeys((prev) => [rec, ...prev]);
      showMessage(`API Key ${rec[0]} provisioned via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onAddKey(newRecord);
      setLiveKeys((prev) => [newRecord, ...prev]);
      showMessage(`Key created locally (${msg}).`);
    }

    setIsAddKeyOpen(false);
    setKeyOwner('');
  };

  // 2. DELETE / REVOKE KEY
  const handleDeleteKey = async (keyId: string) => {
    try {
      await tallybridgeApi.deleteKey(keyId);
      showMessage(`API Key ${keyId} revoked via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Key revoked locally (${msg}).`);
    }
    if (onDeleteKey) {
      onDeleteKey(keyId);
    }
    setLiveKeys((prev) => prev.filter((k) => k[0] !== keyId));
  };

  // 3. TRIGGER SYNC JOB
  const handleTriggerSync = async () => {
    const fallbackId = `SYNC-${Math.floor(8825 + Math.random() * 50)}`;
    const newRecord: SyncJobRecord = [
      fallbackId,
      'Manual ad-hoc batch sync',
      'Enterprise Bus',
      'Just now',
      'Completed',
    ];

    try {
      const job = await tallybridgeApi.triggerSync({
        name: 'Manual ad-hoc batch sync',
        target: 'Enterprise Bus (LedgerOne)',
      });
      const rec = converters.syncJobToRecord(job);
      onRunSync(rec);
      setLiveJobs((prev) => [rec, ...prev]);
      showMessage(`Sync Job ${rec[0]} completed via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onRunSync(newRecord);
      setLiveJobs((prev) => [newRecord, ...prev]);
      showMessage(`Sync job executed locally (${msg}).`);
    }
  };

  // 4. DELETE SYNC JOB
  const handleDeleteSyncJob = async (jobId: string) => {
    try {
      await tallybridgeApi.deleteSyncJob(jobId);
      showMessage(`Sync Job ${jobId} deleted via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Job removed locally (${msg}).`);
    }
    if (onDeleteSyncJob) {
      onDeleteSyncJob(jobId);
    }
    setLiveJobs((prev) => prev.filter((j) => j[0] !== jobId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5" />
            INTEGRATION BUS & PRIVATE NETWORK LINK
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {APPS.tally.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {APPS.tally.desc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadTallyData}
            disabled={isLoading}
            className="text-xs border-slate-300"
            title="Refresh integration database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync DB
          </Button>
          <Badge variant="risk" className="text-xs">
            ● Private Link Subnet: 10.20.4.0/24
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Outside Vendor Service
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="keys" className="py-2">API Keys</TabsTrigger>
          <TabsTrigger value="accounts" className="py-2">Service Accounts</TabsTrigger>
          <TabsTrigger value="apps" className="py-2">Connected Apps</TabsTrigger>
          <TabsTrigger value="buildhost" className="py-2">Build Host (tb-build-02)</TabsTrigger>
          <TabsTrigger value="networkflows" className="py-2">Network Flows (E15)</TabsTrigger>
          <TabsTrigger value="permissions" className="py-2">Permissions</TabsTrigger>
          <TabsTrigger value="controls" className="py-2">Token & IP Controls</TabsTrigger>
          <TabsTrigger value="syncjobs" className="py-2">Sync Jobs</TabsTrigger>
          <TabsTrigger value="apiactivity" className="py-2">API Activity</TabsTrigger>
        </TabsList>

        {/* Tab 1: API Keys (Create, Read, Delete/Revoke) */}
        <TabsContent value="keys">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500" />
                  Provisioned Machine Credentials (E04 & E11)
                </CardTitle>
                <CardDescription className="text-xs">
                  Root Gap: TallyBridge credentials were provisioned with infinite lifetimes and no IP allowlisting.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddKeyOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Provision key
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Key ID</TableHead>
                    <TableHead>Owner / Destination</TableHead>
                    <TableHead className="w-[180px]">Scope Granted</TableHead>
                    <TableHead className="w-[130px]">Token Expiry</TableHead>
                    <TableHead className="w-[160px]">IP Restriction</TableHead>
                    <TableHead className="w-[140px]">Audit Status</TableHead>
                    <TableHead className="w-[90px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveKeys.map((k, i) => (
                    <TableRow
                      key={i}
                      className={
                        k[0] === 'key-tb-07' || k[0] === 'tb-sync-svc'
                          ? 'bg-rose-100/70 font-semibold'
                          : k[0] === 'key-tb-03'
                          ? 'bg-amber-50/70'
                          : undefined
                      }
                    >
                      <TableCell className="font-mono text-xs font-bold">
                        {k[0]}
                        {(k[0] === 'key-tb-07' || k[0] === 'tb-sync-svc') && (
                          <div className="text-[9px] font-bold text-rose-800">
                            COMPROMISED
                          </div>
                        )}
                        {k[0] === 'key-tb-03' && (
                          <div className="text-[9px] font-bold text-amber-800">
                            STALE UNREVOKED (F5)
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-800">{k[1]}</TableCell>
                      <TableCell><code className="text-xs font-mono">{k[2]}</code></TableCell>
                      <TableCell className="text-xs">{k[3]}</TableCell>
                      <TableCell>
                        <Badge variant={k[4].includes('Not restricted') ? 'risk' : 'ok'} className="text-[10px]">
                          {k[4]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={k[5].includes('Compromised') ? 'risk' : k[5].includes('Unrevoked') ? 'warn' : 'ok'}
                          className="text-[10px]"
                        >
                          {k[5]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteKey(k[0])}
                          className="text-xs h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Revoke / Delete Key"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Service Accounts */}
        <TabsContent value="accounts">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  Connected Service Identities
                </CardTitle>
                <CardDescription className="text-xs">
                  Non-human service principals executing automated batch workflows.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddAccountOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add account
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Account Name</TableHead>
                    <TableHead>Managing Team</TableHead>
                    <TableHead className="w-[180px]">Purpose</TableHead>
                    <TableHead className="w-[140px]">Last Used</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamic service accounts */}
                  {liveAccounts.map((acc, i) => (
                    <TableRow key={i} className={acc.id === 'tb-sync-svc' ? 'bg-rose-50/70 font-semibold' : undefined}>
                      <TableCell className="font-mono text-xs font-bold">{acc.id}</TableCell>
                      <TableCell className="text-xs">{acc.owner_team}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{acc.purpose}</TableCell>
                      <TableCell className="font-mono text-xs">{acc.last_used}</TableCell>
                      <TableCell>
                        <Badge variant={acc.status === 'Active' ? 'ok' : 'warn'} className="text-[10px]">
                          {acc.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fallback Seed Accounts */}
                  {liveAccounts.length === 0 && (
                    <TableRow className="bg-rose-100/70 font-semibold">
                      <TableCell className="font-mono text-xs font-bold">tb-sync-svc</TableCell>
                      <TableCell className="text-xs">Finance IT</TableCell>
                      <TableCell className="text-xs font-bold">Vendor and ticket sync</TableCell>
                      <TableCell className="font-mono text-xs">19 Nov 08:30</TableCell>
                      <TableCell><Badge variant="risk" className="text-[10px]">Active</Badge></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Connected Apps */}
        <TabsContent value="apps">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-500" />
                  Connected Applications (E04 & E07)
                </CardTitle>
                <CardDescription className="text-xs">
                  Systems communicating across the TallyBridge integration bus.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsConnectAppOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Connect app
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Application</TableHead>
                    <TableHead className="w-[140px]">Environment</TableHead>
                    <TableHead className="w-[160px]">Account</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead className="w-[140px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamic apps */}
                  {liveApps.map((a, i) => (
                    <TableRow key={i} className={a.status === 'Review' ? 'bg-amber-50/70' : undefined}>
                      <TableCell className="text-xs font-bold text-slate-900">{a.app}</TableCell>
                      <TableCell className="text-xs text-slate-600">{a.env}</TableCell>
                      <TableCell><code className="text-xs font-mono font-bold">{a.account}</code></TableCell>
                      <TableCell className="text-xs">{a.permissions}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === 'Connected' ? 'ok' : 'warn'} className="text-[10px]">
                          {a.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {liveApps.length === 0 && (
                    <TableRow>
                      <TableCell className="text-xs font-bold">LedgerOne</TableCell>
                      <TableCell className="text-xs">Production</TableCell>
                      <TableCell><code>tb-sync-svc</code></TableCell>
                      <TableCell className="text-xs">Vendor read/write</TableCell>
                      <TableCell><Badge variant="ok" className="text-[10px]">Connected</Badge></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Build Host tb-build-02 */}
        <TabsContent value="buildhost">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Server className="w-4 h-4 text-rose-600" />
                  Rogue Build Host: tb-build-02 (10.20.4.77)
                </CardTitle>
                <CardDescription className="text-xs">
                  Smoking Gun: Internal build server in vendor network abused to penetrate Harbor & Finch.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <Alert variant="destructive" className="p-3">
                  <ShieldAlert className="w-4 h-4" />
                  <AlertDescription className="text-xs ml-1 leading-relaxed">
                    This host is NOT an authorized sync worker (which are strictly <code>.11</code> to <code>.16</code>). It is an internal build agent inside TallyBridge that was compromised and used to attack Harbor & Finch!
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between text-xs">
                      <strong className="text-slate-900">09 July 2026 · 22:00 UTC</strong>
                      <span className="text-[11px] font-mono text-slate-500">E15 Flow Log</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Probed <code>LedgerOne-sandbox</code> (10 flows, 331 KB in). Early staging reconnaissance.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between text-xs">
                      <strong className="text-slate-900">16 August 2026 · 18:00–21:00 UTC</strong>
                      <span className="text-[11px] font-mono text-slate-500">E20 OSINT Log</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      TallyBridge status history confirms <code>tb-build-02</code> re-provisioning following intrusion.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/60">
                    <div className="flex justify-between text-xs">
                      <strong className="text-rose-950 font-bold">17–19 August 2026 · 12:10 UTC</strong>
                      <span className="text-[11px] font-mono text-rose-800">E01 & E15 Logs</span>
                    </div>
                    <p className="text-xs text-rose-950 mt-0.5 font-medium">
                      Pulled 22.2 MB from LedgerOne production; queried bank routing instructions and active payment runs.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-rose-300 bg-rose-100/80">
                    <div className="flex justify-between text-xs">
                      <strong className="text-rose-950 font-black">03 September 2026 · 01:44:30 UTC</strong>
                      <span className="text-[11px] font-mono text-rose-800 font-bold">E18 & E19 Logs</span>
                    </div>
                    <p className="text-xs text-rose-950 mt-0.5 font-bold">
                      PATCH /v2/vendors/V-0412/bank-details: Overwrote Coastal Packaging account to ****9083!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Private Link Host Containment
                </CardTitle>
                <CardDescription className="text-xs">
                  Isolate compromised IP 10.20.4.77 at the private tunnel gateway.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">VENDOR HOST LABEL</label>
                  <Input
                    value={hostLabel}
                    onChange={(e) => setHostLabel(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">SUBNET BINDING</label>
                  <Input
                    value={hostEnv}
                    onChange={(e) => setHostEnv(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">GATEWAY POLICY ACTION</label>
                  <select className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800">
                    <option>DROP ALL PACKETS (Isolate 10.20.4.77)</option>
                    <option>Capture full payload for forensics</option>
                  </select>
                </div>
                <Button
                  onClick={() => showMessage('Firewall containment applied: 10.20.4.77 isolated.')}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  Isolate Compromised Host 10.20.4.77
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 5: Network Flows (E15) */}
        <TabsContent value="networkflows">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Network className="w-4 h-4 text-slate-500" />
                  Private-Link Network Flow Log Analysis (E15)
                </CardTitle>
                <CardDescription className="text-xs">
                  Real-time network flows queried from PostgreSQL database table.
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                {liveFlows.length > 0 ? `${liveFlows.length} Flows Ingested` : '70 Rogue Flows Identified'}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Source IP</TableHead>
                    <TableHead className="w-[140px]">Host Label</TableHead>
                    <TableHead className="w-[140px]">Destination IP</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead className="w-[140px]">Bytes Sent</TableHead>
                    <TableHead className="w-[100px]">Verdict</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamic network flows */}
                  {liveFlows.map((f) => (
                    <TableRow
                      key={f.id}
                      className={f.verdict === 'Flagged' ? 'bg-rose-100/70 font-semibold' : undefined}
                    >
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{f.src_ip}</TableCell>
                      <TableCell className="font-bold text-xs">{f.host_label}</TableCell>
                      <TableCell className="font-mono text-xs">{f.dst_ip}</TableCell>
                      <TableCell className="font-mono text-xs">{f.endpoint}</TableCell>
                      <TableCell className="font-mono text-xs">{f.bytes_sent}</TableCell>
                      <TableCell>
                        <Badge variant={f.verdict === 'Flagged' ? 'risk' : 'ok'} className="text-[10px]">
                          {f.verdict}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fallback Historical Seed Rows */}
                  {liveFlows.length === 0 && (
                    <TableRow className="bg-rose-100/80 font-bold">
                      <TableCell className="font-mono text-xs text-rose-950">10.20.4.77</TableCell>
                      <TableCell className="font-bold text-rose-950">tb-build-02</TableCell>
                      <TableCell className="font-mono text-xs">10.20.4.5</TableCell>
                      <TableCell className="font-mono text-xs">/api/v2/vendors/V-0412/bank-details</TableCell>
                      <TableCell className="font-mono text-xs">22.2 MB</TableCell>
                      <TableCell><Badge variant="risk" className="text-[10px]">Flagged</Badge></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Permissions */}
        <TabsContent value="permissions">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                Integration Permissions & Least-Privilege Audit
              </CardTitle>
              <CardDescription className="text-xs">
                Auditing machine credential scopes against the Principle of Least Privilege.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Principal</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Granted Scope</TableHead>
                    <TableHead>IP Restriction</TableHead>
                    <TableHead className="w-[140px]">Security Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {livePerms.map((p, i) => (
                    <TableRow key={i} className={p.risk === 'Over-privileged' ? 'bg-rose-50/60 font-semibold' : undefined}>
                      <TableCell><code className="text-xs font-bold">{p.principal}</code></TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{p.owner}</TableCell>
                      <TableCell><code className="text-xs text-rose-700 font-bold">{p.scope}</code></TableCell>
                      <TableCell className="text-xs text-slate-800">{p.ip_restrict}</TableCell>
                      <TableCell>
                        <Badge variant={p.risk === 'Over-privileged' ? 'risk' : 'warn'} className="text-[10px]">
                          {p.risk}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {livePerms.length === 0 && (
                    <TableRow className="bg-rose-50/60 font-semibold">
                      <TableCell><code>key-tb-07</code></TableCell>
                      <TableCell className="text-xs font-bold">TallyBridge Sync</TableCell>
                      <TableCell><code className="text-rose-700 font-bold">read:write all-modules</code></TableCell>
                      <TableCell className="text-xs">Not restricted</TableCell>
                      <TableCell><Badge variant="risk" className="text-[10px]">Over-privileged</Badge></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Token & IP Controls */}
        <TabsContent value="controls">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-500" />
                  Enforce IT Security Policy TPS-POL-02 (E10)
                </CardTitle>
                <CardDescription className="text-xs">
                  Mandate 90-day key expiration and strict IP allowlisting for financial integrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">TOKEN ROTATION FREQUENCY</label>
                  <select
                    value={tokenLifetime}
                    onChange={(e) => setTokenLifetime(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
                  >
                    <option>90 days (Mandatory Policy v2.1)</option>
                    <option>30 days</option>
                    <option>7 days</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">IP ALLOWLIST RESTRICTION</label>
                  <textarea
                    rows={4}
                    value={ipAllowlist}
                    onChange={(e) => setIpAllowlist(e.target.value)}
                    placeholder="10.20.4.11-10.20.4.16 only"
                    className="w-full text-xs font-mono bg-white border border-slate-200 rounded-md p-2 text-slate-800"
                  />
                </div>
                <Button
                  onClick={() => showMessage('Policy guardrails enforced: IP binding and 90-day expiry active.')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Enforce Policy Guardrails
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Mandatory Compliance Checklist
                </CardTitle>
                <CardDescription className="text-xs">
                  Compliance state against board security mandate.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2.5">
                {[
                  { title: '90-Day Token Expiry Enforced', status: 'VIOLATION (Infinite)' },
                  { title: 'IP Allowlisting Enabled', status: 'VIOLATION (Unrestricted)' },
                  { title: 'Least-Privilege Scope Applied', status: 'VIOLATION (All-Modules)' },
                  { title: 'Annual Third-Party Audit Completed', status: 'VIOLATION (Skipped)' },
                  { title: 'Alerts Configured on Bulk Exports', status: 'VIOLATION (Zero Alerts)' },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-rose-200 bg-rose-50/50"
                  >
                    <span className="text-xs font-bold text-slate-900">{item.title}</span>
                    <Badge variant="risk" className="text-[10px]">{item.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 8: Sync Jobs (Create, Read, Delete) */}
        <TabsContent value="syncjobs">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-slate-500" />
                  Scheduled Synchronization Jobs
                </CardTitle>
                <CardDescription className="text-xs">
                  Automated background data exchange between LedgerOne and HelpDeskr.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleTriggerSync}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1" /> Run sync
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Job ID</TableHead>
                    <TableHead>Job Description</TableHead>
                    <TableHead className="w-[180px]">Target Application</TableHead>
                    <TableHead className="w-[180px]">Execution Timestamp</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[80px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveJobs.map((j, i) => (
                    <TableRow key={i} className={j[4].includes('Timeout') ? 'bg-rose-100/70 font-semibold' : undefined}>
                      <TableCell className="font-mono text-xs font-bold">{j[0]}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{j[1]}</TableCell>
                      <TableCell className="text-xs">{j[2]}</TableCell>
                      <TableCell className="font-mono text-xs">{j[3]}</TableCell>
                      <TableCell>
                        <Badge variant={j[4].includes('Timeout') ? 'risk' : j[4] === 'Completed' ? 'ok' : 'warn'} className="text-[10px]">
                          {j[4]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSyncJob(j[0])}
                          className="text-xs h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                          title="Delete Sync Job"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 9: API Activity */}
        <TabsContent value="apiactivity">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  Integration API Activity Log (Live Stream & E01/E18)
                </CardTitle>
                <CardDescription className="text-xs">
                  Unified live audit activity streamed from database across business systems.
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                {liveActivity.length > 0 ? `${liveActivity.length} Live Activity Records` : '12 Forensic API Calls Flagged'}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">System</TableHead>
                    <TableHead className="w-[140px]">Credential</TableHead>
                    <TableHead className="w-[100px]">Method</TableHead>
                    <TableHead>Endpoint</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[160px]">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamic API Activity from Backend */}
                  {liveActivity.map((r, i) => (
                    <TableRow
                      key={i}
                      className={r.endpoint?.includes('bank-details') ? 'bg-rose-100/80 font-bold' : undefined}
                    >
                      <TableCell className="font-bold text-xs">{r.system}</TableCell>
                      <TableCell><code className="text-xs font-bold">{r.actor || 'anonymous'}</code></TableCell>
                      <TableCell className="font-mono text-xs font-bold">{r.method}</TableCell>
                      <TableCell className="font-mono text-xs">{r.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant={r.status === '200' || r.status === '201' || r.status === '202' ? 'ok' : 'risk'} className="text-[10px]">
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-[11px] text-slate-600">
                        {r.ts ? new Date(r.ts).toLocaleString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fallback Seed Forensic Logs */}
                  {liveActivity.length === 0 &&
                    FORENSIC_API_LOGS.slice(0, 5).map((r, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-bold text-xs">LedgerOne</TableCell>
                        <TableCell><code>{r.apiKeyId}</code></TableCell>
                        <TableCell className="font-mono text-xs">{r.method}</TableCell>
                        <TableCell className="font-mono text-xs">{r.endpoint}</TableCell>
                        <TableCell><Badge variant="ok" className="text-[10px]">{r.statusCode}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{r.timestampUtc}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Provision Key Dialog */}
      <Dialog
        isOpen={isAddKeyOpen}
        onClose={() => setIsAddKeyOpen(false)}
        title="Provision Integration API Key"
        description="Configure access scopes and security controls for new machine tokens via API."
      >
        <form onSubmit={handleCreateKey} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">OWNER</label>
            <Input
              value={keyOwner}
              onChange={(e) => setKeyOwner(e.target.value)}
              placeholder="e.g. Finance IT"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">SCOPE</label>
            <Input
              value={keyScope}
              onChange={(e) => setKeyScope(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">TOKEN EXPIRY</label>
            <select
              value={keyExpiry}
              onChange={(e) => setKeyExpiry(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
            >
              <option>90 days (Mandatory)</option>
              <option>30 days</option>
              <option>No expiry (Non-compliant)</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">IP RESTRICTION</label>
            <Input
              value={keyIp}
              onChange={(e) => setKeyIp(e.target.value)}
              placeholder="10.20.4.0/24"
            />
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Provision Key via API
          </Button>
        </form>
      </Dialog>

      {/* Add Service Account Dialog */}
      <Dialog
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        title="Add Machine Service Account"
        description="Register a non-human identity for batch replication."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            showMessage(`Service account ${accountName || 'service-sync'} registered.`);
            setIsAddAccountOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">ACCOUNT NAME</label>
            <Input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. sync-batch-worker"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">MANAGING TEAM</label>
            <Input
              value={accountTeam}
              onChange={(e) => setAccountTeam(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">PURPOSE</label>
            <Input
              value={accountPurpose}
              onChange={(e) => setAccountPurpose(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Save Service Account
          </Button>
        </form>
      </Dialog>

      {/* Connect App Dialog */}
      <Dialog
        isOpen={isConnectAppOpen}
        onClose={() => setIsConnectAppOpen(false)}
        title="Connect Business Application"
        description="Link a new operational portal to the integration bus."
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            showMessage(`Application ${appName || 'Connected App'} linked to bus.`);
            setIsConnectAppOpen(false);
          }}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">APPLICATION NAME</label>
            <Input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. Warehouse Fleet Portal"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">INTEGRATION CHANNEL</label>
            <select
              value={appEnv}
              onChange={(e) => setAppEnv(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
            >
              <option>Private Link (10.20.4.0/24)</option>
              <option>External Cloud API</option>
              <option>Storage API</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Connect Application
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
