import { useState } from 'react';
import type { DocRecord, KeyRecord } from '../types';
import { APPS } from '../data/mockData';
import { BLUEVAULT_ACCESS_LOGS } from '../data/caseEvidenceData';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
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
  Folder,
  FolderOpen,
  FileSpreadsheet,
  Key,
  ShieldAlert,
  Clock,
  History,
  Lock,
  Plus,
} from 'lucide-react';

interface BlueVaultViewProps {
  docs: DocRecord[];
  keys: KeyRecord[];
  onAddDoc: (doc: DocRecord) => void;
  onAddKey: (key: KeyRecord) => void;
  showMessage: (msg: string) => void;
}

export function BlueVaultView({
  docs,
  keys,
  onAddDoc,
  onAddKey,
  showMessage,
}: BlueVaultViewProps) {
  const [activeTab, setActiveTab] = useState('folders');
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  const folders = [
    { name: 'Finance / Bank Instructions', count: '3 files', compromised: true },
    { name: 'Finance / Payment Runs', count: '2 files', compromised: false },
    { name: 'Finance / Statements', count: '13 files', compromised: true },
    { name: 'Customer Documents (Pune Depot Portal)', count: '24 files', compromised: true },
    { name: 'Operations / Manifests', count: '18 files', compromised: false },
    { name: 'Support Attachments', count: '45 files', compromised: false },
  ];

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUploadFile) {
      showMessage('Choose a file first.');
      return;
    }
    const ext = selectedUploadFile.name.split('.').pop()?.toUpperCase() || 'FILE';
    onAddDoc([
      selectedUploadFile.name,
      'Finance / Bank Instructions',
      ext,
      'Restricted',
    ]);
    setIsAddDocOpen(false);
    setSelectedUploadFile(null);
    showMessage('Document metadata added to register.');
  };

  const handleGenerateKey = () => {
    const newId = `bvk-${Math.random().toString(36).substring(2, 6)}`;
    onAddKey([
      newId,
      'Security Audit Ops',
      'read:all-folders',
      '90 days',
      '10.20.0.0/16',
      'Active',
    ]);
    showMessage('Storage access key generated.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1 flex items-center gap-1.5">
            <Folder className="w-3.5 h-3.5" />
            ENTERPRISE FILE STORAGE & REPOSITORY
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {APPS.blue.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {APPS.blue.desc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="risk" className="text-xs">
            <Clock className="w-3.5 h-3.5 mr-1" />
            Hardware Clock Drifts (Fast)
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Shared File Storage
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="folders" className="py-2">Folders & Documents</TabsTrigger>
          <TabsTrigger value="finance" className="py-2">Finance Folder</TabsTrigger>
          <TabsTrigger value="keys" className="py-2">API Keys (bvk-7f3a)</TabsTrigger>
          <TabsTrigger value="logs" className="py-2">Access Logs (E05)</TabsTrigger>
          <TabsTrigger value="permissions" className="py-2">Folder Permissions</TabsTrigger>
        </TabsList>

        {/* Tab 1 & 2: Folders & Documents */}
        {(activeTab === 'folders' || activeTab === 'finance') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-slate-500" />
                  Shared Directory Tree
                </CardTitle>
                <CardDescription className="text-xs">
                  Storage hierarchies across departments.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {folders.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => showMessage(`Browsing folder: ${f.name}`)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-all ${
                      f.compromised
                        ? 'border-rose-200 bg-rose-50/50 hover:bg-rose-50'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className={`w-4 h-4 ${f.compromised ? 'text-rose-600' : 'text-slate-500'}`} />
                      <span className="text-xs font-bold text-slate-800">{f.name}</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500">{f.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                    Confidential Finance & Master Files (E05)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Banking spreadsheets and payment disbursement templates.
                  </CardDescription>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsAddDocOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add document
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Folder Path</TableHead>
                      <TableHead className="w-[80px]">Type</TableHead>
                      <TableHead className="w-[180px]">Access / Exfil Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.map((doc, idx) => (
                      <TableRow
                        key={idx}
                        className={doc[3].includes('Exfiltrated') ? 'bg-rose-50/60 font-semibold' : undefined}
                      >
                        <TableCell className="font-mono text-xs font-bold text-slate-900">
                          {doc[0]}
                        </TableCell>
                        <TableCell className="text-xs text-slate-600">{doc[1]}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">
                            {doc[2]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={doc[3].includes('Exfiltrated') ? 'risk' : doc[3] === 'Restricted' ? 'warn' : 'ok'}
                            className="text-[10px]"
                          >
                            {doc[3]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: API Keys */}
        {activeTab === 'keys' && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500" />
                  Storage Access Keys (E04 & Risk R-029)
                </CardTitle>
                <CardDescription className="text-xs">
                  Storage key <code>bvk-7f3a</code> was provisioned for Customer Portal with over-privileged <code>read:all-folders</code>, leaked into <code>TKT-48213</code>, and weaponized.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={handleGenerateKey}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Generate key
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Key ID</TableHead>
                    <TableHead>Owner & System</TableHead>
                    <TableHead className="w-[180px]">Scope</TableHead>
                    <TableHead className="w-[130px]">Expiry</TableHead>
                    <TableHead className="w-[160px]">IP Restriction</TableHead>
                    <TableHead className="w-[180px]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((k, i) => (
                    <TableRow
                      key={i}
                      className={k[0] === 'bvk-7f3a' ? 'bg-rose-50/70 font-semibold' : undefined}
                    >
                      <TableCell className="font-mono text-xs font-bold">
                        {k[0]}
                        {k[0] === 'bvk-7f3a' && (
                          <div className="text-[9px] font-bold text-rose-800">
                            LEAKED IN TKT-48213
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
                          variant={k[5].includes('Leaked') ? 'risk' : k[5].includes('Active') ? 'ok' : 'warn'}
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
        )}

        {/* Tab 4: Access Logs (E05) */}
        {activeTab === 'logs' && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  BlueVault Access Log & Clock Skew Forensics (E05)
                </CardTitle>
                <CardDescription className="text-xs">
                  Hardware clock was never synchronized and runs minutes fast. 679 events lack source IPs. Correlated to UTC.
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                3.46 MB Master Bank Sheet Stolen
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Alert variant="destructive" className="m-4 mb-2">
                <ShieldAlert className="w-4 h-4" />
                <AlertDescription className="text-xs ml-1 leading-relaxed">
                  Attacker token <code>bvk-7f3a</code> stolen from ticket <code>TKT-48213</code> was weaponized on 14–16 August from external IPs <code>198.18.7.23</code>, <code>198.18.7.24</code>, and <code>198.18.7.77</code> to download <code>vendor-bank-details-2026.xlsx</code> and financial statements!
                </AlertDescription>
              </Alert>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">Event ID</TableHead>
                    <TableHead className="w-[170px]">Normalized UTC / Epoch</TableHead>
                    <TableHead className="w-[130px]">Caller IP</TableHead>
                    <TableHead className="w-[120px]">Key ID</TableHead>
                    <TableHead>Action & Target File</TableHead>
                    <TableHead className="w-[110px]">Data Size</TableHead>
                    <TableHead>Forensic Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {BLUEVAULT_ACCESS_LOGS.map((log) => (
                    <TableRow
                      key={log.eventId}
                      className={log.path.includes('vendor-bank-details') ? 'bg-rose-100/70 font-semibold' : 'bg-rose-50/40'}
                    >
                      <TableCell className="font-mono text-xs font-bold">{log.eventId}</TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="font-bold text-slate-900">{log.normalizedUtc}</div>
                        <div className="text-[11px] text-slate-500">Epoch: {log.epochSeconds}</div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.callerIp}</TableCell>
                      <TableCell><code className="text-xs font-bold">{log.keyId}</code></TableCell>
                      <TableCell className="text-xs">
                        <strong>{log.action}</strong> <code className="font-mono">{log.path}</code>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">
                        {(log.bytesTransferred / 1024 / 1024).toFixed(2)} MB
                      </TableCell>
                      <TableCell className="text-xs text-rose-900">{log.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Tab 5: Permissions */}
        {activeTab === 'permissions' && (
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                Folder-Level Permissions vs. Key Scope Disparity
              </CardTitle>
              <CardDescription className="text-xs">
                Root Flaw: BlueVault folder ACLs restricted <code>/finance</code> to Finance staff, but machine key <code>bvk-7f3a</code> had <code>read:all-folders</code>, which bypassed directory boundaries.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Folder Path</TableHead>
                    <TableHead>Role / Principal</TableHead>
                    <TableHead>Intended Permission</TableHead>
                    <TableHead>Actual Access with bvk-7f3a</TableHead>
                    <TableHead className="w-[140px]">Audit Evaluation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['/finance/bank-instructions', 'Finance Team', 'Read / Write', 'READABLE (Bypassed)', 'VULNERABLE'],
                    ['/finance/statements', 'Finance Team', 'Read only', 'READABLE (Bypassed)', 'VULNERABLE'],
                    ['/finance/payment-runs', 'Payment Operations', 'Read / Write', 'READABLE (Bypassed)', 'VULNERABLE'],
                    ['/customer-docs', 'Support Ops', 'Read only', 'READABLE (Intended)', 'Normal'],
                  ].map((r, i) => (
                    <TableRow key={i} className={r[4] === 'VULNERABLE' ? 'bg-rose-50/70 font-semibold' : undefined}>
                      <TableCell className="font-mono text-xs font-bold">{r[0]}</TableCell>
                      <TableCell className="text-xs">{r[1]}</TableCell>
                      <TableCell><code className="text-xs">{r[2]}</code></TableCell>
                      <TableCell>
                        <strong className={r[3].includes('Bypassed') ? 'text-rose-700' : 'text-slate-800'}>
                          {r[3]}
                        </strong>
                      </TableCell>
                      <TableCell>
                        <Badge variant={r[4] === 'VULNERABLE' ? 'risk' : 'ok'} className="text-[10px]">
                          {r[4]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </Tabs>

      {/* Add Document Dialog */}
      <Dialog
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Add Document to Register"
        description="Select a metadata file to register inside BlueVault repository."
      >
        <form onSubmit={handleSaveUpload} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">SELECT LOCAL FILE</label>
            <input
              type="file"
              onChange={(e) => setSelectedUploadFile(e.target.files ? e.target.files[0] : null)}
              className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white"
            />
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Register Document
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
