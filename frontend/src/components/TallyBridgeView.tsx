import { useState } from 'react';
import type { KeyRecord, SyncJobRecord } from '../types';
import { APPS } from '../data/mockData';
import { FORENSIC_API_LOGS } from '../data/caseEvidenceData';
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
} from 'lucide-react';

interface TallyBridgeViewProps {
  keys: KeyRecord[];
  jobs: SyncJobRecord[];
  onAddKey: (key: KeyRecord) => void;
  onRunSync: (job: SyncJobRecord) => void;
  showMessage: (msg: string) => void;
}

export function TallyBridgeView({
  keys,
  jobs,
  onAddKey,
  onRunSync,
  showMessage,
}: TallyBridgeViewProps) {
  const [activeTab, setActiveTab] = useState('keys');

  // Create API Key modal
  const [isAddKeyOpen, setIsAddKeyOpen] = useState(false);
  const [keyOwner, setKeyOwner] = useState('');
  const [keyScope, setKeyScope] = useState('read:write all-modules');
  const [keyExpiry, setKeyExpiry] = useState('90 days');
  const [keyIp, setKeyIp] = useState('10.20.4.0/24');

  // Service accounts
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [accountName, setAccountName] = useState('');
  const [accountTeam, setAccountTeam] = useState('IT Operations');
  const [accountPurpose, setAccountPurpose] = useState('Database replication');

  // Connected apps
  const [isConnectAppOpen, setIsConnectAppOpen] = useState(false);
  const [appName, setAppName] = useState('');
  const [appEnv, setAppEnv] = useState('Simulated');

  // Token & IP Controls
  const [tokenLifetime, setTokenLifetime] = useState('90 days');
  const [ipAllowlist, setIpAllowlist] = useState('10.20.4.0/24');

  // Build Host config
  const [hostLabel, setHostLabel] = useState('tb-build-02');
  const [hostEnv, setHostEnv] = useState('Private Link (10.20.4.77)');

  const handleCreateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyOwner.trim()) {
      showMessage('Key owner is required.');
      return;
    }
    const newId = `key-tb-${Math.floor(10 + Math.random() * 90)}`;
    onAddKey([
      newId,
      keyOwner.trim(),
      keyScope,
      keyExpiry,
      keyIp || 'Not restricted',
      'Active',
    ]);
    setIsAddKeyOpen(false);
    setKeyOwner('');
    showMessage('API key created in simulation.');
  };

  const handleTriggerSync = () => {
    const newId = `SYNC-${Math.floor(8825 + Math.random() * 50)}`;
    onRunSync([newId, 'Manual ad-hoc sync', 'Enterprise Bus', 'Just now', 'Completed']);
    showMessage('Sync job queued in simulation.');
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

        {/* Tab 1: API Keys */}
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
                    <TableHead className="w-[180px]">Audit Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k, i) => (
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
                    <TableHead className="w-[180px]">Target Application</TableHead>
                    <TableHead className="w-[180px]">Assigned Role</TableHead>
                    <TableHead className="w-[180px]">Privilege Classification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['tb-sync-svc', 'Support Ops / TallyBridge', 'HelpDeskr & LedgerOne', 'Global Sync Agent', 'Admin (Excessive)'],
                    ['tb-mon-01', 'TallyBridge Network Ops', 'Private Tunnel Gateway', 'Ping Heartbeat', 'Port 0 only'],
                    ['tb-build-02', 'Vendor CI/CD Infrastructure', 'LedgerOne & Sandbox', 'Build Server (Unregistered)', 'ROGUE HOST (Compromised)'],
                    ['bv-archive-svc', 'IT Operations', 'BlueVault', 'Doc Archival', 'Folder-scoped'],
                  ].map((r, i) => (
                    <TableRow key={i} className={r[0] === 'tb-build-02' ? 'bg-rose-100/70 font-semibold' : undefined}>
                      <TableCell className="font-mono text-xs font-bold">{r[0]}</TableCell>
                      <TableCell className="text-xs">{r[1]}</TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{r[2]}</TableCell>
                      <TableCell className="text-xs">{r[3]}</TableCell>
                      <TableCell>
                        <Badge variant={r[4].includes('ROGUE') || r[4].includes('Excessive') ? 'risk' : 'ok'} className="text-[10px]">
                          {r[4]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
                    <TableHead className="w-[180px]">Channel</TableHead>
                    <TableHead className="w-[160px]">Credential Used</TableHead>
                    <TableHead>Permissions Granted</TableHead>
                    <TableHead className="w-[180px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['LedgerOne (Production)', 'Private Link (10.20.4.0/24)', 'key-tb-07', 'read:write all-modules', 'Connected (Compromised)'],
                    ['LedgerOne (Sandbox Staging)', 'Private Link (10.20.4.0/24)', 'sandbox-test-key', 'read:all', 'Probed on 09 July (E15)'],
                    ['HelpDeskr (Support)', 'External Cloud API', 'tb-sync-svc', 'admin (unrestricted)', 'Connected (Compromised)'],
                    ['BlueVault (Storage)', 'Storage API', 'bvk-7f3a', 'read:all-folders', 'Connected (Leaked in Chat)'],
                  ].map((r, i) => (
                    <TableRow key={i} className={r[4].includes('Compromised') ? 'bg-rose-50/60 font-semibold' : undefined}>
                      <TableCell className="text-xs font-bold text-slate-900">{r[0]}</TableCell>
                      <TableCell className="text-xs text-slate-600">{r[1]}</TableCell>
                      <TableCell><code className="text-xs font-mono font-bold">{r[2]}</code></TableCell>
                      <TableCell className="text-xs">{r[3]}</TableCell>
                      <TableCell>
                        <Badge variant={r[4].includes('Compromised') ? 'risk' : 'warn'} className="text-[10px]">
                          {r[4]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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
                  Analysis of 9,790 flows across <code>10.20.4.0/24</code> subnet.
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                70 Rogue Flows Identified
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[170px]">Date / Time (UTC)</TableHead>
                    <TableHead className="w-[130px]">Source IP</TableHead>
                    <TableHead className="w-[140px]">Host Label</TableHead>
                    <TableHead className="w-[160px]">Destination</TableHead>
                    <TableHead className="w-[80px]">Port</TableHead>
                    <TableHead className="w-[180px]">Bytes Transferred</TableHead>
                    <TableHead>Behavioral Assessment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-rose-100/80 font-bold">
                    <TableCell className="font-mono text-xs">17-19 Aug 12:10–13:01</TableCell>
                    <TableCell className="font-mono text-xs text-rose-950">10.20.4.77</TableCell>
                    <TableCell className="font-bold text-rose-950">tb-build-02</TableCell>
                    <TableCell className="font-bold text-rose-950">LedgerOne Production</TableCell>
                    <TableCell className="font-mono text-xs">443</TableCell>
                    <TableCell className="font-mono text-xs text-rose-950">22,215,099 bytes in (~22.2 MB)</TableCell>
                    <TableCell>
                      <Badge variant="risk" className="text-[10px]">Malicious Database Exfil</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-rose-50/50">
                    <TableCell className="font-mono text-xs">09 July 22:00–22:52</TableCell>
                    <TableCell className="font-mono text-xs">10.20.4.77</TableCell>
                    <TableCell className="font-bold text-rose-900">tb-build-02</TableCell>
                    <TableCell className="font-bold text-slate-800">LedgerOne-sandbox</TableCell>
                    <TableCell className="font-mono text-xs">443</TableCell>
                    <TableCell className="font-mono text-xs">331 KB in / 94 KB out</TableCell>
                    <TableCell>
                      <Badge variant="warn" className="text-[10px]">Staging Reconnaissance</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">Nightly (01:00–02:59)</TableCell>
                    <TableCell className="font-mono text-xs">10.20.4.11–.16</TableCell>
                    <TableCell className="text-slate-800">tb-sync-01..06</TableCell>
                    <TableCell className="text-slate-800">LedgerOne & HelpDeskr</TableCell>
                    <TableCell className="font-mono text-xs">443</TableCell>
                    <TableCell className="font-mono text-xs">~14 KB per flow</TableCell>
                    <TableCell>
                      <Badge variant="ok" className="text-[10px]">Legitimate Nightly Sync</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-mono text-xs">Continuous (Every 10m)</TableCell>
                    <TableCell className="font-mono text-xs">10.20.4.10</TableCell>
                    <TableCell className="text-slate-800">tb-mon-01</TableCell>
                    <TableCell className="text-slate-800">TunnelGateway</TableCell>
                    <TableCell className="font-mono text-xs">0</TableCell>
                    <TableCell className="font-mono text-xs">64 bytes (ICMP)</TableCell>
                    <TableCell>
                      <Badge variant="ok" className="text-[10px]">Heartbeat Ping</Badge>
                    </TableCell>
                  </TableRow>
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
                    <TableHead>Application</TableHead>
                    <TableHead>Granted Scope</TableHead>
                    <TableHead>Recommended Scope</TableHead>
                    <TableHead className="w-[180px]">Security Risk</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['key-tb-07', 'LedgerOne', 'read:write all-modules', 'vendor:read, vendor:contact:update', 'CRITICAL (Enabled Bank Tampering)'],
                    ['tb-sync-svc', 'HelpDeskr', 'admin', 'ticket:read, ticket:sync', 'CRITICAL (Enabled Mass Ticket Exfil)'],
                    ['bvk-7f3a', 'BlueVault', 'read:all-folders', 'customer-docs:read', 'CRITICAL (Enabled Bank Sheet Theft)'],
                    ['key-tb-03', 'LedgerOne', 'read:vendors', 'REVOKE (Superseded Key)', 'MEDIUM (Stale Account)'],
                  ].map((r, i) => (
                    <TableRow key={i} className="bg-rose-50/60 font-semibold">
                      <TableCell><code className="text-xs font-bold">{r[0]}</code></TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{r[1]}</TableCell>
                      <TableCell><code className="text-xs text-rose-700 font-bold">{r[2]}</code></TableCell>
                      <TableCell className="text-xs text-slate-800">{r[3]}</TableCell>
                      <TableCell>
                        <Badge variant="risk" className="text-[10px]">{r[4]}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
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

        {/* Tab 8: Sync Jobs */}
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
                    <TableHead className="w-[140px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {jobs.map((j, i) => (
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
                  Integration API Activity Log (E01 & E18)
                </CardTitle>
                <CardDescription className="text-xs">
                  API calls executed by TallyBridge credentials key-tb-07 and tb-sync-svc.
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                12 Malicious API Calls Flagged
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Request ID</TableHead>
                    <TableHead className="w-[160px]">Timestamp (UTC)</TableHead>
                    <TableHead className="w-[120px]">Credential</TableHead>
                    <TableHead className="w-[130px]">Caller IP</TableHead>
                    <TableHead>Method & Endpoint</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[80px]">Records</TableHead>
                    <TableHead>Security Footprint</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FORENSIC_API_LOGS.map((r, i) => (
                    <TableRow
                      key={i}
                      className={
                        r.phaseCategory === 'FRAUD EXECUTION'
                          ? 'bg-rose-100/80 font-bold'
                          : r.anomalyFlag
                          ? 'bg-rose-50/50'
                          : undefined
                      }
                    >
                      <TableCell className="font-mono text-xs font-bold">{r.requestId}</TableCell>
                      <TableCell className="font-mono text-xs">{r.timestampUtc}</TableCell>
                      <TableCell><code className="text-xs font-bold">{r.apiKeyId}</code></TableCell>
                      <TableCell className="font-mono text-xs">{r.callerIp}</TableCell>
                      <TableCell className="font-mono text-xs font-bold">{r.method} {r.endpoint}</TableCell>
                      <TableCell>
                        <Badge variant={r.statusCode === 200 || r.statusCode === 204 ? 'ok' : 'risk'} className="text-[10px]">
                          {r.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{r.recordsReturned}</TableCell>
                      <TableCell className="text-xs text-rose-900">{r.notes}</TableCell>
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
        description="Configure access scopes and security controls for new machine tokens."
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
            Provision Key
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
