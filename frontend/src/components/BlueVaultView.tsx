import { useState, useEffect, useCallback } from 'react';
import type { DocRecord, KeyRecord } from '../types';
import { APPS } from '../data/mockData';
import { BLUEVAULT_ACCESS_LOGS } from '../data/caseEvidenceData';
import {
  bluevaultApi,
  converters,
  type StorageAccessLogDto,
} from '../services/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
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
  Trash2,
  RefreshCw,
  Eye,
} from 'lucide-react';

interface BlueVaultViewProps {
  docs: DocRecord[];
  keys: KeyRecord[];
  onAddDoc: (doc: DocRecord) => void;
  onDeleteDoc?: (docName: string) => void;
  onAddKey: (key: KeyRecord) => void;
  onDeleteKey?: (keyId: string) => void;
  showMessage: (msg: string) => void;
}

export function BlueVaultView({
  docs,
  keys,
  onAddDoc,
  onDeleteDoc,
  onAddKey,
  onDeleteKey,
  showMessage,
}: BlueVaultViewProps) {
  const [activeTab, setActiveTab] = useState('folders');

  // Live state
  const [liveDocs, setLiveDocs] = useState<DocRecord[]>(docs);
  const [liveKeys, setLiveKeys] = useState<KeyRecord[]>(keys);
  const [liveLogs, setLiveLogs] = useState<StorageAccessLogDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Add document modal
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFolder, setNewDocFolder] = useState('Finance / Bank Instructions');
  const [newDocType, setNewDocType] = useState('XLSX');
  const [newDocAccess, setNewDocAccess] = useState('Restricted');

  // Generate key modal
  const [isGenKeyOpen, setIsGenKeyOpen] = useState(false);
  const [keyOwner, setKeyOwner] = useState('Customer Portal Sync');
  const [keyScope, setKeyScope] = useState('read:all-folders');
  const [keyExpiry, setKeyExpiry] = useState('No expiry (Never)');
  const [keyIpRestrict, setKeyIpRestrict] = useState('Not restricted (0.0.0.0/0)');

  // File explorer preview
  const [previewFile, setPreviewFile] = useState<{ path: string; content: string; actor: string } | null>(null);

  const folders = [
    { name: 'Finance / Bank Instructions', path: '/finance/bank-instructions', count: '3 files', compromised: true },
    { name: 'Finance / Payment Runs', path: '/finance/payment-runs', count: '2 files', compromised: false },
    { name: 'Finance / Statements', path: '/finance/statements', count: '13 files', compromised: true },
    { name: 'Customer Documents (Pune Depot)', path: '/customer-docs', count: '24 files', compromised: true },
    { name: 'Operations / Manifests', path: '/operations/manifests', count: '18 files', compromised: false },
    { name: 'Support Attachments', path: '/support-attachments', count: '45 files', compromised: false },
  ];

  // Async data fetch on mount
  useEffect(() => {
    let active = true;
    Promise.allSettled([
      bluevaultApi.getDocuments(),
      bluevaultApi.getKeys(),
      bluevaultApi.getAccessLogs(),
    ]).then(([dRes, kRes, lRes]) => {
      if (!active) return;
      if (dRes.status === 'fulfilled' && dRes.value.length > 0) {
        setLiveDocs(dRes.value.map(converters.docToRecord));
      }
      if (kRes.status === 'fulfilled' && kRes.value.length > 0) {
        setLiveKeys(kRes.value.map(converters.keyToRecord));
      }
      if (lRes.status === 'fulfilled') {
        setLiveLogs(lRes.value);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Manual DB sync
  const loadBlueVaultData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dRes, kRes, lRes] = await Promise.allSettled([
        bluevaultApi.getDocuments(),
        bluevaultApi.getKeys(),
        bluevaultApi.getAccessLogs(),
      ]);

      if (dRes.status === 'fulfilled' && dRes.value.length > 0) {
        setLiveDocs(dRes.value.map(converters.docToRecord));
      }
      if (kRes.status === 'fulfilled' && kRes.value.length > 0) {
        setLiveKeys(kRes.value.map(converters.keyToRecord));
      }
      if (lRes.status === 'fulfilled') {
        setLiveLogs(lRes.value);
      }
    } catch {
      // offline fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 1. CREATE DOCUMENT
  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName.trim()) {
      showMessage('Please enter a document filename.');
      return;
    }
    const newRecord: DocRecord = [
      newDocName.trim(),
      newDocFolder,
      newDocType,
      newDocAccess,
    ];

    try {
      const created = await bluevaultApi.createDocument({
        name: newDocName.trim(),
        folder: newDocFolder,
        file_type: newDocType,
        access: newDocAccess,
      });
      const rec = converters.docToRecord(created);
      onAddDoc(rec);
      setLiveDocs((prev) => [rec, ...prev]);
      showMessage(`Document ${rec[0]} registered in database via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onAddDoc(newRecord);
      setLiveDocs((prev) => [newRecord, ...prev]);
      showMessage(`Document registered locally (${msg}).`);
    }

    setIsAddDocOpen(false);
    setNewDocName('');
  };

  // 2. DELETE DOCUMENT
  const handleDeleteDocument = async (docName: string) => {
    try {
      await bluevaultApi.deleteDocument(docName);
      showMessage(`Document ${docName} deleted from BlueVault via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Document removed locally (${msg}).`);
    }
    if (onDeleteDoc) {
      onDeleteDoc(docName);
    }
    setLiveDocs((prev) => prev.filter((d) => d[0] !== docName));
  };

  // 3. GENERATE KEY
  const handleGenerateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    const fallbackId = `bvk-${Math.random().toString(36).substring(2, 6)}`;
    const newRecord: KeyRecord = [
      fallbackId,
      keyOwner,
      keyScope,
      keyExpiry,
      keyIpRestrict,
      'Active',
    ];

    try {
      const created = await bluevaultApi.generateKey({
        owner: keyOwner,
        scope: keyScope,
        expiry: keyExpiry,
        ip_restrict: keyIpRestrict,
      });
      const rec = converters.keyToRecord(created);
      onAddKey(rec);
      setLiveKeys((prev) => [rec, ...prev]);
      showMessage(`Storage key ${rec[0]} generated in database via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onAddKey(newRecord);
      setLiveKeys((prev) => [newRecord, ...prev]);
      showMessage(`Storage key generated locally (${msg}).`);
    }

    setIsGenKeyOpen(false);
  };

  // 4. REVOKE / DELETE KEY
  const handleRevokeKey = async (keyId: string) => {
    try {
      await bluevaultApi.revokeKey(keyId);
      showMessage(`Storage key ${keyId} revoked and removed via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Key revoked locally (${msg}).`);
    }
    if (onDeleteKey) {
      onDeleteKey(keyId);
    }
    setLiveKeys((prev) => prev.filter((k) => k[0] !== keyId));
  };

  // 5. INTERACTIVE EXPLORER & READ FILE
  const handleBrowseFolder = async (folderPath: string) => {
    try {
      const res = await bluevaultApi.listDirectory(folderPath);
      showMessage(`Navigated to ${res.path} (${res.files.length} documents indexed). Access logged.`);
    } catch {
      showMessage(`Browsing folder: ${folderPath}`);
    }
  };

  const handleReadFile = async (filePath: string) => {
    try {
      const res = await bluevaultApi.readFile(filePath);
      setPreviewFile({
        path: res.path,
        content: res.content,
        actor: res.actor,
      });
      showMessage(`File read: ${filePath}. Exfiltration access logged to audit.`);
    } catch {
      setPreviewFile({
        path: filePath,
        content: `Confidential Vendor Master Routing & Accounts:\nCoastal Packaging Ltd: ****4417\nDeccan Container Lines: ****6542\nNorthstar Freight Co: ****4417`,
        actor: 'bvk-7f3a',
      });
      showMessage(`File preview: ${filePath}`);
    }
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
          <Button
            variant="outline"
            size="sm"
            onClick={loadBlueVaultData}
            disabled={isLoading}
            className="text-xs border-slate-300"
            title="Refresh storage database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync DB
          </Button>
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

        {/* Tab 1 & 2: Folders & Documents (Full CRUD) */}
        {(activeTab === 'folders' || activeTab === 'finance') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="md:col-span-1">
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-slate-500" />
                  Shared Directory Tree
                </CardTitle>
                <CardDescription className="text-xs">
                  Click any folder to trigger API directory listing.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-2">
                {folders.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => handleBrowseFolder(f.path)}
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
                    Banking spreadsheets and payment disbursement files in PostgreSQL.
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
                      <TableHead className="w-[180px]">Access Status</TableHead>
                      <TableHead className="w-[100px] text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {liveDocs.map((doc, idx) => (
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
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReadFile(doc[0])}
                              className="text-xs h-7 px-2 text-slate-700 hover:bg-slate-100"
                              title="Read / Inspect document"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc[0])}
                              className="text-xs h-7 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              title="Delete document"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tab 3: API Keys (Create, Read, Revoke/Delete) */}
        {activeTab === 'keys' && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500" />
                  Storage Access Keys (E04 & Risk R-029)
                </CardTitle>
                <CardDescription className="text-xs">
                  Storage key <code>bvk-7f3a</code> was provisioned for Customer Portal with over-privileged <code>read:all-folders</code>.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsGenKeyOpen(true)}
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
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead className="w-[90px] text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveKeys.map((k, i) => (
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
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRevokeKey(k[0])}
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
                  Hardware clock was never synchronized and runs minutes fast. Real events streamed from database.
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                {liveLogs.length > 0 ? `${liveLogs.length} Live DB Access Logs` : '3.46 MB Master Bank Sheet Stolen'}
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
                    <TableHead className="w-[140px]">Principal</TableHead>
                    <TableHead className="w-[130px]">Caller IP</TableHead>
                    <TableHead className="w-[100px]">Action</TableHead>
                    <TableHead>Target Path</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamic logs from backend */}
                  {liveLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className={log.path?.includes('vendor-bank-details') ? 'bg-rose-100/70 font-semibold' : undefined}
                    >
                      <TableCell className="font-mono text-xs font-bold text-slate-900">{log.id}</TableCell>
                      <TableCell><code className="text-xs font-bold">{log.principal || 'anonymous'}</code></TableCell>
                      <TableCell className="font-mono text-xs">{log.source_ip || 'unknown'}</TableCell>
                      <TableCell>
                        <Badge
                          variant={log.action === 'read' ? 'risk' : 'ok'}
                          className="text-[10px]"
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-rose-950 font-bold">{log.path}</TableCell>
                    </TableRow>
                  ))}

                  {/* Fallback Historical Case Logs */}
                  {liveLogs.length === 0 &&
                    BLUEVAULT_ACCESS_LOGS.map((log) => (
                      <TableRow
                        key={log.eventId}
                        className={log.path.includes('vendor-bank-details') ? 'bg-rose-100/70 font-semibold' : 'bg-rose-50/40'}
                      >
                        <TableCell className="font-mono text-xs font-bold">{log.eventId}</TableCell>
                        <TableCell><code className="text-xs font-bold">{log.keyId}</code></TableCell>
                        <TableCell className="font-mono text-xs">{log.callerIp}</TableCell>
                        <TableCell>
                          <Badge variant="risk" className="text-[10px]">{log.action}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono">{log.path}</TableCell>
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
        description="Register a new document metadata entry in BlueVault via API."
      >
        <form onSubmit={handleSaveDocument} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">DOCUMENT NAME</label>
            <Input
              value={newDocName}
              onChange={(e) => setNewDocName(e.target.value)}
              placeholder="e.g. vendor-bank-details-2026.xlsx"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">FOLDER</label>
            <select
              value={newDocFolder}
              onChange={(e) => setNewDocFolder(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
            >
              <option>Finance / Bank Instructions</option>
              <option>Finance / Payment Runs</option>
              <option>Finance / Statements</option>
              <option>Customer Documents</option>
              <option>Operations / Manifests</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">FILE TYPE</label>
              <Input
                value={newDocType}
                onChange={(e) => setNewDocType(e.target.value)}
                placeholder="XLSX"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">ACCESS RESTRICTION</label>
              <select
                value={newDocAccess}
                onChange={(e) => setNewDocAccess(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
              >
                <option>Restricted</option>
                <option>Internal</option>
                <option>Exfiltrated (Target)</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Save Document via API
          </Button>
        </form>
      </Dialog>

      {/* Generate Key Dialog */}
      <Dialog
        isOpen={isGenKeyOpen}
        onClose={() => setIsGenKeyOpen(false)}
        title="Generate Storage Access Key"
        description="Provision machine storage key via POST /api/storage/keys."
      >
        <form onSubmit={handleGenerateKey} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">KEY OWNER / SYSTEM</label>
            <Input
              value={keyOwner}
              onChange={(e) => setKeyOwner(e.target.value)}
              placeholder="e.g. Pune Depot Portal"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">PERMISSION SCOPE</label>
            <select
              value={keyScope}
              onChange={(e) => setKeyScope(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
            >
              <option>read:all-folders</option>
              <option>read:customer-docs</option>
              <option>admin:all-repos</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">EXPIRATION</label>
            <Input
              value={keyExpiry}
              onChange={(e) => setKeyExpiry(e.target.value)}
              placeholder="No expiry (Never)"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">IP RESTRICTION</label>
            <Input
              value={keyIpRestrict}
              onChange={(e) => setKeyIpRestrict(e.target.value)}
              placeholder="Not restricted (0.0.0.0/0)"
            />
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Generate Key via API
          </Button>
        </form>
      </Dialog>

      {/* File Content Preview Dialog */}
      {previewFile && (
        <Dialog
          isOpen={true}
          onClose={() => setPreviewFile(null)}
          title={`File Content: ${previewFile.path}`}
          description={`Accessed by ${previewFile.actor} via GET /api/storage/read`}
        >
          <div className="space-y-3">
            <div className="p-3 bg-slate-900 rounded font-mono text-xs text-emerald-400 max-h-60 overflow-y-auto whitespace-pre-wrap">
              {previewFile.content}
            </div>
            <div className="text-[11px] text-slate-500">
              Every read action records a live forensic entry in <code>storage_access_logs</code>.
            </div>
            <Button
              onClick={() => setPreviewFile(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              Close Viewer
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
