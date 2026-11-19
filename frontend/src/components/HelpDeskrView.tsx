import { useState } from 'react';
import type { TicketRecord } from '../types';
import { APPS } from '../data/mockData';
import { EXPORT_JOBS_E02_E06 } from '../data/caseEvidenceData';
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
  LifeBuoy,
  Search,
  Plus,
  AlertTriangle,
  FileSpreadsheet,
  Paperclip,
  Key,
  ShieldCheck,
  History,
  MessageSquare,
} from 'lucide-react';

interface HelpDeskrViewProps {
  tickets: TicketRecord[];
  onAddTicket: (ticket: TicketRecord) => void;
  onUpdateTicketStatus: (index: number, newStatus: string) => void;
  showMessage: (msg: string) => void;
}

export function HelpDeskrView({
  tickets,
  onAddTicket,
  onUpdateTicketStatus,
  showMessage,
}: HelpDeskrViewProps) {
  const [activeTab, setActiveTab] = useState('tickets');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createRequester, setCreateRequester] = useState('');
  const [createSubject, setCreateSubject] = useState('');
  const [createPriority, setCreatePriority] = useState('Normal');

  const [selectedTicketIndex, setSelectedTicketIndex] = useState<number | null>(null);
  const [ticketNewStatus, setTicketNewStatus] = useState('Open');

  // Comment state
  const [commentType, setCommentType] = useState('Internal note');
  const [commentText, setCommentText] = useState('');

  // Attachments state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Integration API state
  const [apiBasePath, setApiBasePath] = useState('/api/v1/support');
  const [apiActor, setApiActor] = useState('tb-sync-svc');
  const [apiAccessStatus, setApiAccessStatus] = useState('Enabled');

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createRequester.trim() || !createSubject.trim()) {
      showMessage('Requester and subject are required.');
      return;
    }
    const newId = `HD-${Math.floor(2050 + Math.random() * 50)}`;
    onAddTicket([
      newId,
      createSubject.trim(),
      createRequester.trim(),
      createPriority,
      'Open',
      'Support Queue',
    ]);
    setIsCreateOpen(false);
    setCreateRequester('');
    setCreateSubject('');
    setCreatePriority('Normal');
    showMessage('Ticket created in demo data.');
  };

  const handleOpenTicketModal = (index: number) => {
    setSelectedTicketIndex(index);
    setTicketNewStatus(tickets[index][4]);
  };

  const handleSaveTicketStatus = () => {
    if (selectedTicketIndex !== null) {
      onUpdateTicketStatus(selectedTicketIndex, ticketNewStatus);
      setSelectedTicketIndex(null);
      showMessage('Ticket updated.');
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return t.some((field) => field.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1 flex items-center gap-1.5">
            <LifeBuoy className="w-3.5 h-3.5" />
            SUPPORT OPERATIONS & AUDIT TRAIL
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {APPS.help.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {APPS.help.desc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="warn" className="text-xs">
            ● Tenant Time: IST (UTC+5:30)
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Simulated SaaS
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="tickets" className="py-2">Tickets</TabsTrigger>
          <TabsTrigger value="comments" className="py-2">Comments & Notes (TKT-48213)</TabsTrigger>
          <TabsTrigger value="exports" className="py-2">Export Jobs (E02/E06)</TabsTrigger>
          <TabsTrigger value="attachments" className="py-2">Attachments</TabsTrigger>
          <TabsTrigger value="integration" className="py-2">Integration API</TabsTrigger>
          <TabsTrigger value="rbac" className="py-2">Access Control</TabsTrigger>
          <TabsTrigger value="audithistory" className="py-2">Audit History</TabsTrigger>
        </TabsList>

        {/* Tab 1: Tickets */}
        <TabsContent value="tickets">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Support Tickets & Service Queues
                </CardTitle>
                <CardDescription className="text-xs">
                  Customer inquiries and internal tickets across depots.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 text-xs h-9"
                  />
                </div>
                <Button
                  onClick={() => setIsCreateOpen(true)}
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Create ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Ticket ID</TableHead>
                    <TableHead>Subject & Context</TableHead>
                    <TableHead className="w-[150px]">Requester</TableHead>
                    <TableHead className="w-[100px]">Priority</TableHead>
                    <TableHead className="w-[110px]">Status</TableHead>
                    <TableHead className="w-[140px]">Assigned Queue</TableHead>
                    <TableHead className="w-[90px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((row, i) => (
                    <TableRow
                      key={row[0]}
                      className={row[0] === 'TKT-48213' ? 'bg-rose-50/70 hover:bg-rose-50 font-medium' : undefined}
                    >
                      <TableCell className="align-top font-mono font-bold text-xs">
                        {row[0]}
                        {row[0] === 'TKT-48213' && (
                          <div className="text-[9px] font-bold text-rose-700 tracking-wider">
                            KEY LEAK SOURCE
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="font-bold text-slate-900 text-xs">{row[1]}</div>
                        {row[0] === 'TKT-48213' && (
                          <div className="text-[11px] text-rose-900 mt-0.5">
                            Customer pasted BlueVault key <code>bvk-7f3a</code> here on 25 June. Exfiltrated by attacker in <code>E02</code>.
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="align-top text-xs text-slate-700">{row[2]}</TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant={row[3] === 'High' ? 'risk' : row[3] === 'Low' ? 'ok' : 'warn'}
                          className="text-[10px]"
                        >
                          {row[3]}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant={row[4] === 'Resolved' ? 'ok' : row[4] === 'Open' ? 'risk' : 'warn'}
                          className="text-[10px]"
                        >
                          {row[4]}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top text-xs text-slate-600">{row[5]}</TableCell>
                      <TableCell className="align-top">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenTicketModal(i)}
                          className="text-xs h-7 px-2"
                        >
                          Inspect
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Comments & Notes */}
        <TabsContent value="comments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-slate-500" />
                  Ticket Conversation · TKT-48213 (The Storage Key Leak)
                </CardTitle>
                <CardDescription className="text-xs">
                  The smoking gun ticket where storage credential <code>bvk-7f3a</code> was exposed in clear text.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <Alert variant="warning" className="p-3 text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="ml-1 leading-relaxed">
                    <strong>Forensic Link (E13 & E11):</strong> Sunita Iyer instructed customer to paste portal configuration. Attacker harvested this ticket via <code>tb-sync-svc</code> on 11-12 August, then unlocked BlueVault on 14-16 August.
                  </AlertDescription>
                </Alert>

                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <div className="flex justify-between text-xs">
                    <strong className="text-slate-900">Pune Depot Logistics · Customer</strong>
                    <span className="text-[11px] font-mono text-slate-500">25 Jun · 11:12 IST</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    Our depot portal cannot retrieve Proof of Delivery (POD) documents. The integration returns 401 Unauthorized errors.
                  </p>
                </div>

                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <div className="flex justify-between text-xs">
                    <strong className="text-slate-900">Sunita Iyer · Support Team Lead</strong>
                    <span className="text-[11px] font-mono text-slate-500">25 Jun · 11:20 IST</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    Can you please paste your connection configuration and credentials here so I can verify?
                  </p>
                </div>

                <div className="border border-rose-300 bg-rose-50/80 p-3 rounded-lg">
                  <div className="flex justify-between text-xs">
                    <strong className="text-rose-950 font-bold">Pune Depot Logistics · Pasted Secrets</strong>
                    <span className="text-[11px] font-mono text-rose-700 font-bold">25 Jun · 11:31 IST</span>
                  </div>
                  <p className="text-xs font-mono text-rose-950 mt-1 bg-white/70 p-2 rounded border border-rose-200">
                    endpoint: bluevault.harborfinch.internal/customer-docs <br />
                    <strong>ACCESS_KEY: bvk-7f3a</strong> (Scope: read:all-folders)
                  </p>
                </div>

                <div className="border border-amber-200 bg-amber-50/60 p-3 rounded-lg">
                  <div className="flex justify-between text-xs">
                    <strong className="text-amber-900">A. Nair · Support Representative</strong>
                    <span className="text-[11px] font-mono text-amber-700">25 Jun · 11:34 IST</span>
                  </div>
                  <p className="text-xs text-amber-950 mt-1">
                    ⚠️ Should we be pasting keys in tickets? Internal Audit (IA-2025-09 Finding F2) warned about credential leakage in HelpDeskr.
                  </p>
                </div>

                <div className="border border-slate-200 p-3 rounded-lg bg-slate-50/50">
                  <div className="flex justify-between text-xs">
                    <strong className="text-slate-900">Sunita Iyer · Support Team Lead</strong>
                    <span className="text-[11px] font-mono text-slate-500">25 Jun · 11:36 IST</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">
                    It is how we have always done it, the secure link tool is not ready. I will tidy the ticket later.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Add Support Note / Note Record
                </CardTitle>
                <CardDescription className="text-xs">
                  Record support interactions or attach observations.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">NOTE CLASSIFICATION</label>
                  <select
                    value={commentType}
                    onChange={(e) => setCommentType(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950"
                  >
                    <option>Internal note</option>
                    <option>Public comment</option>
                    <option>Security incident note</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">MESSAGE</label>
                  <textarea
                    rows={6}
                    placeholder="Enter observation notes..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950"
                  />
                </div>
                <Button
                  onClick={() => {
                    if (!commentText.trim()) {
                      showMessage('Please enter note text.');
                      return;
                    }
                    showMessage('Comment saved in audit log.');
                    setCommentText('');
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Save Note
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Export Jobs */}
        <TabsContent value="exports">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-rose-600" />
                  HelpDeskr Bulk Export Audit Trail (E02 & E06 Reconciliation)
                </CardTitle>
                <CardDescription className="text-xs">
                  Reconciliation of all 14 August export jobs matching Invoice <code>INV-HD-2026-0831</code> (5 plan + 9 billed @ ₹2,500 = ₹22,500 overage).
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                10 Attacker Jobs · 4 Legitimate Jobs
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Job ID</TableHead>
                    <TableHead className="w-[160px]">Created Time (IST / UTC)</TableHead>
                    <TableHead className="w-[140px]">Principal</TableHead>
                    <TableHead className="w-[130px]">Caller IP</TableHead>
                    <TableHead className="w-[120px]">Records</TableHead>
                    <TableHead className="w-[150px]">Classification</TableHead>
                    <TableHead className="w-[130px]">Status</TableHead>
                    <TableHead>Forensic Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {EXPORT_JOBS_E02_E06.map((job) => (
                    <TableRow
                      key={job.jobId}
                      className={
                        job.status === 'Stuck on Delete'
                          ? 'bg-rose-100/70 font-semibold'
                          : job.type === 'Malicious Batch Export'
                          ? 'bg-rose-50/40'
                          : undefined
                      }
                    >
                      <TableCell className="font-mono text-xs font-bold">
                        {job.jobId}
                        {job.status === 'Stuck on Delete' && (
                          <div className="text-[9px] font-bold text-rose-800">
                            SMOKING GUN TRACE
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <div className="font-bold text-slate-900">{job.createdTimeIst} IST</div>
                        <div className="text-[11px] text-slate-500">{job.createdTimeUtc} UTC</div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs font-mono font-bold">{job.requester}</code>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{job.callerIp}</TableCell>
                      <TableCell className="font-bold text-xs">{job.recordsCount.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={job.type === 'Malicious Batch Export' ? 'risk' : 'ok'} className="text-[10px]">
                          {job.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={job.status === 'Stuck on Delete' ? 'risk' : job.status === 'Completed' ? 'warn' : 'ok'}
                          className="text-[10px]"
                        >
                          {job.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{job.notes}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Attachments */}
        <TabsContent value="attachments">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-slate-500" />
                Ticket Attachments & Uploaded Configs
              </CardTitle>
              <CardDescription className="text-xs">
                Inspect files submitted by depot customers and warehouse staff.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-900 file:text-white hover:file:bg-slate-800"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    if (selectedFile) {
                      showMessage(`Attachment registered: ${selectedFile.name}`);
                    } else {
                      showMessage('Select a file first.');
                    }
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs"
                >
                  Attach file
                </Button>
              </div>

              <div className="divide-y divide-slate-100">
                <div className="flex items-center justify-between py-2.5">
                  <div className="text-xs font-mono font-bold text-rose-900">pune_depot_portal_config_v2.json</div>
                  <Badge variant="risk" className="text-[10px]">TKT-48213 · Contains bvk-7f3a</Badge>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div className="text-xs font-mono text-slate-800">shipment_manifest_sample.pdf</div>
                  <Badge variant="secondary" className="text-[10px]">HD-2048 · PDF</Badge>
                </div>
                <div className="flex items-center justify-between py-2.5">
                  <div className="text-xs font-mono text-slate-800">invoice_scan_august.pdf</div>
                  <Badge variant="secondary" className="text-[10px]">HD-2047 · PDF</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 5: Integration API */}
        <TabsContent value="integration">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Key className="w-4 h-4 text-slate-500" />
                  HelpDeskr Integration API Settings
                </CardTitle>
                <CardDescription className="text-xs">
                  SaaS API parameters used by automated partner synchronizers.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">API BASE PATH</label>
                  <Input
                    value={apiBasePath}
                    onChange={(e) => setApiBasePath(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">INTEGRATION ACTOR</label>
                  <Input
                    value={apiActor}
                    onChange={(e) => setApiActor(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">ACCESS STATUS</label>
                  <select
                    value={apiAccessStatus}
                    onChange={(e) => setApiAccessStatus(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-950"
                  >
                    <option>Enabled</option>
                    <option>Disabled</option>
                  </select>
                </div>
                <Button
                  onClick={() => showMessage('API parameters saved.')}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Save Configuration
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Integration API Activity (E02)
                </CardTitle>
                <CardDescription className="text-xs">
                  Real audit log requests executed by machine identities.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50">
                  <div className="flex justify-between text-xs">
                    <strong className="text-slate-900 font-mono">POST /api/v1/exports (EXP-5410)</strong>
                    <span className="text-[11px] font-mono text-slate-500">11 Aug · 23:30 IST</span>
                  </div>
                  <div className="text-xs text-rose-900 mt-1">
                    Caller: <code>tb-sync-svc</code> (198.18.7.41) · 25,390 tickets queued
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                  <div className="flex justify-between text-xs">
                    <strong className="text-slate-900 font-mono">GET /api/v1/exports/5410/download</strong>
                    <span className="text-[11px] font-mono text-slate-500">11 Aug · 23:32 IST</span>
                  </div>
                  <div className="text-xs text-slate-700 mt-1">
                    Caller: <code>tb-sync-svc</code> (198.18.7.41) · 200 OK (Downloaded)
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-rose-300 bg-rose-100/70">
                  <div className="flex justify-between text-xs">
                    <strong className="text-rose-950 font-mono font-bold">DELETE /api/v1/exports/5419</strong>
                    <span className="text-[11px] font-mono text-rose-800">12 Aug · 00:33 IST</span>
                  </div>
                  <div className="text-xs text-rose-950 font-semibold mt-1">
                    Caller: <code>tb-sync-svc</code> (198.18.7.58) · 504 Gateway Timeout (Job Preserved in E02!)
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 6: RBAC */}
        <TabsContent value="rbac">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                Role-Based Access Control Privileges
              </CardTitle>
              <CardDescription className="text-xs">
                Root Flaw: <code>tb-sync-svc</code> was assigned global <strong>admin</strong> scope without IP boundaries.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Identity / Principal</TableHead>
                    <TableHead>Ticket Access</TableHead>
                    <TableHead>Bulk Export</TableHead>
                    <TableHead>Job Deletion</TableHead>
                    <TableHead>Audit Level</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['Support Agent', 'Assigned tickets', 'No', 'No', 'Limited'],
                    ['Support Lead (Sunita Iyer)', 'All tickets', 'Weekly Tuesday only', 'No', 'Full'],
                    ['tb-sync-svc (TallyBridge)', 'ALL TICKETS (Admin)', 'UNRESTRICTED', 'UNRESTRICTED', 'Unmonitored'],
                    ['Customer Portal User', 'Own tickets only', 'No', 'No', 'None'],
                  ].map((r, i) => (
                    <TableRow key={i} className={r[0].includes('tb-sync-svc') ? 'bg-rose-50/70 font-semibold' : undefined}>
                      <TableCell className="font-bold">{r[0]}</TableCell>
                      <TableCell className="text-xs">{r[1]}</TableCell>
                      <TableCell>
                        <Badge variant={r[2].includes('UNRESTRICTED') ? 'risk' : 'ok'} className="text-[10px]">
                          {r[2]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={r[3].includes('UNRESTRICTED') ? 'risk' : 'ok'} className="text-[10px]">
                          {r[3]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">{r[4]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: Audit History */}
        <TabsContent value="audithistory">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                HelpDeskr Audit Log Extract (E02)
              </CardTitle>
              <CardDescription className="text-xs">
                Key events extracted from the 25,390 rows in E02.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Time (IST)</TableHead>
                    <TableHead className="w-[140px]">Actor</TableHead>
                    <TableHead className="w-[130px]">IP Address</TableHead>
                    <TableHead className="w-[140px]">Event</TableHead>
                    <TableHead className="w-[120px]">Target Object</TableHead>
                    <TableHead>Result & Note</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['12 Aug 00:33:14', 'tb-sync-svc', '198.18.7.58', 'export.delete', 'EXP-5419', 'Timeout (Error) — Preserved Forensics'],
                    ['11 Aug 23:59:02', 'tb-sync-svc', '198.18.7.58', 'export.create', 'EXP-5418', 'Success'],
                    ['11 Aug 23:30:10', 'tb-sync-svc', '198.18.7.41', 'export.create', 'EXP-5410', 'Success (First bulk exfil)'],
                    ['11 Aug 09:15:00', 's.iyer', '172.16.4.22', 'export.create', 'EXP-5409', 'Success (Normal Tuesday export)'],
                    ['25 Jun 11:31:00', 's.iyer', '172.16.4.22', 'comment.create', 'TKT-48213', 'Success (Key bvk-7f3a Pasted)'],
                  ].map((r, i) => (
                    <TableRow key={i} className={r[5].includes('Timeout') ? 'bg-rose-50/70 font-semibold' : undefined}>
                      <TableCell className="font-mono text-xs font-bold">{r[0]}</TableCell>
                      <TableCell><code className="text-xs font-bold">{r[1]}</code></TableCell>
                      <TableCell className="font-mono text-xs">{r[2]}</TableCell>
                      <TableCell className="font-bold text-xs">{r[3]}</TableCell>
                      <TableCell><code className="text-xs">{r[4]}</code></TableCell>
                      <TableCell>
                        <Badge variant={r[5].includes('Timeout') ? 'risk' : r[5].includes('Normal') ? 'ok' : 'warn'} className="text-[10px]">
                          {r[5]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Ticket Dialog (shadcn Dialog) */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Support Ticket"
        description="Submit a new customer inquiry into HelpDeskr queues."
      >
        <form onSubmit={handleCreateTicket} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">REQUESTER</label>
            <Input
              value={createRequester}
              onChange={(e) => setCreateRequester(e.target.value)}
              placeholder="e.g. Maya Chen"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">SUBJECT</label>
            <Input
              value={createSubject}
              onChange={(e) => setCreateSubject(e.target.value)}
              placeholder="e.g. Shipment documents access issue"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">PRIORITY</label>
            <select
              value={createPriority}
              onChange={(e) => setCreatePriority(e.target.value)}
              className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
            >
              <option>Normal</option>
              <option>High</option>
              <option>Low</option>
            </select>
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Create Ticket
          </Button>
        </form>
      </Dialog>

      {/* Inspect Ticket Dialog */}
      {selectedTicketIndex !== null && tickets[selectedTicketIndex] && (
        <Dialog
          isOpen={true}
          onClose={() => setSelectedTicketIndex(null)}
          title={`Ticket ${tickets[selectedTicketIndex][0]}`}
          description={`Requester: ${tickets[selectedTicketIndex][2]}`}
        >
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="text-xs font-semibold text-slate-500">SUBJECT</div>
              <div className="text-sm font-bold text-slate-900 mt-0.5">
                {tickets[selectedTicketIndex][1]}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">UPDATE STATUS</label>
              <select
                value={ticketNewStatus}
                onChange={(e) => setTicketNewStatus(e.target.value)}
                className="w-full text-xs bg-white border border-slate-200 rounded-md p-2 text-slate-800"
              >
                <option>Open</option>
                <option>In progress</option>
                <option>Resolved</option>
              </select>
            </div>
            <Button
              type="button"
              onClick={handleSaveTicketStatus}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
            >
              Save Changes
            </Button>
          </div>
        </Dialog>
      )}
    </div>
  );
}
