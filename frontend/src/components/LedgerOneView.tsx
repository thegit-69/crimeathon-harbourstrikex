import { useState, useEffect, useCallback } from 'react';
import type { InvoiceRecord, VendorRecord } from '../types';
import { APPS } from '../data/mockData';
import { FORENSIC_API_LOGS } from '../data/caseEvidenceData';
import {
  ledgeroneApi,
  converters,
  type BankDetailChangeDto,
  type ScheduledPaymentDto,
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
  Landmark,
  Building2,
  CreditCard,
  Calendar,
  CheckSquare,
  History,
  Terminal,
  ShieldAlert,
  Plus,
  Download,
  RefreshCw,
} from 'lucide-react';

interface LedgerOneViewProps {
  vendors: VendorRecord[];
  invoices: InvoiceRecord[];
  onAddVendor: (vendor: VendorRecord) => void;
  onAddInvoice: (inv: InvoiceRecord) => void;
  showMessage: (msg: string) => void;
}

export function LedgerOneView({
  vendors,
  invoices,
  onAddVendor,
  onAddInvoice,
  showMessage,
}: LedgerOneViewProps) {
  const [activeTab, setActiveTab] = useState('vendors');

  // Live state synchronized with backend
  const [liveVendors, setLiveVendors] = useState<VendorRecord[]>(vendors);
  const [liveInvoices, setLiveInvoices] = useState<InvoiceRecord[]>(invoices);
  const [livePayments, setLivePayments] = useState<ScheduledPaymentDto[]>([]);
  const [liveChanges, setLiveChanges] = useState<BankDetailChangeDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingBank, setIsUpdatingBank] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Export vendor directory modal
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportData, setExportData] = useState<{
    export_id: string;
    request_id: string;
    records: number;
    data: Array<{ id: string; name: string; bank_account: string }>;
  } | null>(null);

  // Register vendor modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [bankAccount, setBankAccount] = useState('•••• 0000');

  // Update bank details form
  const [updateVendorId, setUpdateVendorId] = useState('V-0412');
  const [updateAccount, setUpdateAccount] = useState('•••• 4417');
  const [updateApprovalRef, setUpdateApprovalRef] = useState('APR-1280');

  // Add invoice modal
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceVendor, setInvoiceVendor] = useState('Coastal Packaging Ltd.');
  const [invoiceAmount, setInvoiceAmount] = useState('₹1,20,000');
  const [invoiceDue, setInvoiceDue] = useState('08 Sep 2026');

  // Schedule payment form
  const [schedVendor, setSchedVendor] = useState('Coastal Packaging Ltd.');
  const [schedAmount, setSchedAmount] = useState('₹2,48,000');
  const [schedDate, setSchedDate] = useState('2026-09-08');

  // Load live data from FastAPI Backend
  const loadLedgerData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [vRes, iRes, pRes, cRes] = await Promise.allSettled([
        ledgeroneApi.getVendors(),
        ledgeroneApi.getInvoices(),
        ledgeroneApi.getScheduledPayments(),
        ledgeroneApi.getChangeHistory(),
      ]);

      if (vRes.status === 'fulfilled' && vRes.value.length > 0) {
        setLiveVendors(vRes.value.map(converters.vendorToRecord));
      }
      if (iRes.status === 'fulfilled' && iRes.value.length > 0) {
        setLiveInvoices(iRes.value.map(converters.invoiceToRecord));
      }
      if (pRes.status === 'fulfilled') {
        setLivePayments(pRes.value);
      }
      if (cRes.status === 'fulfilled') {
        setLiveChanges(cRes.value);
      }
    } catch {
      // offline fallback keeps local state
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.allSettled([
      ledgeroneApi.getVendors(),
      ledgeroneApi.getInvoices(),
      ledgeroneApi.getScheduledPayments(),
      ledgeroneApi.getChangeHistory(),
    ]).then(([vRes, iRes, pRes, cRes]) => {
      if (!active) return;
      if (vRes.status === 'fulfilled' && vRes.value.length > 0) {
        setLiveVendors(vRes.value.map(converters.vendorToRecord));
      }
      if (iRes.status === 'fulfilled' && iRes.value.length > 0) {
        setLiveInvoices(iRes.value.map(converters.invoiceToRecord));
      }
      if (pRes.status === 'fulfilled') {
        setLivePayments(pRes.value);
      }
      if (cRes.status === 'fulfilled') {
        setLiveChanges(cRes.value);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleRegisterVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId.trim() || !vendorName.trim()) {
      showMessage('Vendor ID and name are required.');
      return;
    }
    const newRecord: VendorRecord = [
      vendorId.trim(),
      vendorName.trim(),
      bankAccount.trim() || '•••• 0000',
      'Active',
      'Pending review',
    ];

    try {
      const created = await ledgeroneApi.createVendor({
        id: vendorId.trim(),
        name: vendorName.trim(),
        bank_account: bankAccount.trim() || '•••• 0000',
      });
      const rec = converters.vendorToRecord(created);
      onAddVendor(rec);
      setLiveVendors((prev) => [rec, ...prev]);
      showMessage(`Vendor ${vendorId.trim()} saved to database via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onAddVendor(newRecord);
      setLiveVendors((prev) => [newRecord, ...prev]);
      showMessage(`Vendor saved locally (API note: ${msg}).`);
    }

    setIsRegisterOpen(false);
    setVendorId('');
    setVendorName('');
    setBankAccount('•••• 0000');
  };

  const handleAddInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = invoiceId.trim() || `INV-${Math.floor(9090 + Math.random() * 50)}`;
    const newRecord: InvoiceRecord = [id, invoiceVendor, invoiceAmount, invoiceDue, 'Awaiting approval'];

    try {
      const cleanAmount = invoiceAmount.replace(/[^0-9]/g, '') || '120000';
      const created = await ledgeroneApi.createInvoice({
        id,
        vendor: invoiceVendor,
        amount: cleanAmount,
        due_date: invoiceDue,
      });
      const rec = converters.invoiceToRecord(created);
      onAddInvoice(rec);
      setLiveInvoices((prev) => [rec, ...prev]);
      showMessage(`Invoice ${id} registered via API.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      onAddInvoice(newRecord);
      setLiveInvoices((prev) => [newRecord, ...prev]);
      showMessage(`Invoice ${id} added locally (API note: ${msg}).`);
    }

    setIsAddInvoiceOpen(false);
    setInvoiceId('');
  };

  const handleUpdateBankDetails = async () => {
    if (!updateVendorId.trim() || !updateAccount.trim()) {
      showMessage('Vendor ID and bank account are required.');
      return;
    }
    setIsUpdatingBank(true);
    try {
      const res = await ledgeroneApi.patchBankDetails(updateVendorId.trim(), {
        new_account: updateAccount.trim(),
        approval_ref: updateApprovalRef.trim() || null,
        actor: 'm.sundar',
      });
      // Update vendor in liveVendors table
      setLiveVendors((prev) =>
        prev.map((v) =>
          v[0] === updateVendorId.trim()
            ? [v[0], v[1], res.new_account, 'Active', updateApprovalRef.trim() ? 'Approved' : 'Unauthorized Tamper']
            : v
        )
      );
      showMessage(
        `Bank routing for ${updateVendorId} updated via API (Change Ref: ${res.change_id}).`
      );
      // Reload change history
      const chg = await ledgeroneApi.getChangeHistory();
      setLiveChanges(chg);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Bank detail update failed: ${msg}`);
    } finally {
      setIsUpdatingBank(false);
    }
  };

  const handleExportVendors = async () => {
    setIsExporting(true);
    try {
      const exp = await ledgeroneApi.exportVendors();
      setExportData(exp);
      setIsExportModalOpen(true);
      showMessage(`Reconnaissance Export complete: ${exp.records} vendor records retrieved.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Vendor export failed: ${msg}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSchedulePayment = async () => {
    try {
      const cleanAmount = schedAmount.replace(/[^0-9]/g, '') || '248000';
      const pay = await ledgeroneApi.schedulePayment({
        vendor_id: updateVendorId || 'V-0412',
        vendor: schedVendor,
        amount: cleanAmount,
        pay_date: schedDate,
      });
      setLivePayments((prev) => [pay, ...prev]);
      showMessage(`Disbursement scheduled via API for ${schedVendor} (${schedAmount}).`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showMessage(`Scheduled batch recorded locally (${msg}).`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-1 flex items-center gap-1.5">
            <Landmark className="w-3.5 h-3.5" />
            FINANCIAL ACCOUNTING & DISBURSEMENT CORE
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {APPS.ledger.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {APPS.ledger.desc}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadLedgerData}
            disabled={isLoading}
            className="text-xs border-slate-300"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Sync DB
          </Button>
          <Badge variant="risk" className="text-xs">
            ● Logging Clock: UTC (90-day retention)
          </Badge>
          <Badge variant="secondary" className="text-xs">
            Finance Engine
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="vendors" className="py-2">Vendors (V-0412)</TabsTrigger>
          <TabsTrigger value="bank" className="py-2">Bank Details</TabsTrigger>
          <TabsTrigger value="invoices" className="py-2">Invoices (INV-9081)</TabsTrigger>
          <TabsTrigger value="schedule" className="py-2">Payment Schedule (08 Sep Run)</TabsTrigger>
          <TabsTrigger value="approvals" className="py-2">Approvals</TabsTrigger>
          <TabsTrigger value="changes" className="py-2">Change History (E19)</TabsTrigger>
          <TabsTrigger value="apilogs" className="py-2">API Logs (E01/E18)</TabsTrigger>
        </TabsList>

        {/* Tab 1: Vendors */}
        <TabsContent value="vendors">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  Vendor Master Directory & Routing Numbers
                </CardTitle>
                <CardDescription className="text-xs">
                  Freight hauliers, packaging suppliers, and fuel contractors connected to PostgreSQL.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportVendors}
                  disabled={isExporting}
                  className="border-slate-300 text-xs shrink-0"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  {isExporting ? 'Exporting...' : 'Export Directory'}
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsRegisterOpen(true)}
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Register vendor
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[120px]">Vendor ID</TableHead>
                    <TableHead>Vendor Legal Entity</TableHead>
                    <TableHead className="w-[160px]">Active Bank Account</TableHead>
                    <TableHead className="w-[130px]">Status</TableHead>
                    <TableHead className="w-[180px]">Approval Status</TableHead>
                    <TableHead className="w-[90px]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveVendors.map((v, i) => (
                    <TableRow
                      key={i}
                      className={v[0] === 'V-0412' ? 'bg-rose-100/70 font-semibold' : undefined}
                    >
                      <TableCell className="font-mono text-xs font-bold">
                        {v[0]}
                        {v[0] === 'V-0412' && (
                          <div className="text-[9px] font-bold text-rose-800">
                            FRAUD TARGET
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900 text-xs">{v[1]}</div>
                        {v[0] === 'V-0412' && (
                          <div className="text-[11px] text-rose-900 font-normal mt-0.5">
                            Target of unauthorized API bank modification on 03 Sep (req-5f61b0de8)
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <code className={`text-xs font-mono font-bold ${v[0] === 'V-0412' ? 'text-rose-950 bg-rose-200 px-1.5 py-0.5 rounded' : ''}`}>
                          {v[2]}
                        </code>
                        {v[0] === 'V-0412' && (
                          <div className="text-[11px] text-rose-900 font-normal mt-0.5">
                            Original: <code>•••• 4417</code>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={v[3].includes('Tampered') ? 'risk' : 'ok'} className="text-[10px]">
                          {v[3]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={v[4] === 'Approved' ? 'ok' : v[4].includes('Unauthorized') ? 'risk' : 'warn'}
                          className="text-[10px]"
                        >
                          {v[4]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUpdateVendorId(v[0]);
                            setActiveTab('bank');
                          }}
                          className="text-xs h-7 px-2"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Bank Details */}
        <TabsContent value="bank">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  Vendor Bank Routing Registry
                </CardTitle>
                <CardDescription className="text-xs">
                  Active disbursement destinations for upcoming payment runs.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <Alert className="p-3 border-rose-300 bg-rose-50/90 text-rose-950">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <AlertDescription className="text-xs ml-1 leading-relaxed">
                    <strong>Offensive Exploit Success on V-0412:</strong> Coastal Packaging Ltd routing was silently modified on <strong>2026-09-03 01:44:30 UTC</strong> by <code>key-tb-07</code> from rogue host <code>10.20.4.77</code> (<code>req-5f61b0de8</code>). Approval Reference was left blank, bypassing authorization!
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {liveVendors.map((v, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        v[0] === 'V-0412' ? 'border-rose-300 bg-rose-50/80' : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-900">{v[1]}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          ID: {v[0]} · Account: <strong className="text-slate-800">{v[2]}</strong>
                        </div>
                        {v[0] === 'V-0412' && (
                          <div className="text-[11px] text-rose-800 font-bold mt-1">
                            Genuine account was •••• 4417 (verified in BlueVault)
                          </div>
                        )}
                      </div>
                      <Badge variant={v[0] === 'V-0412' ? 'risk' : 'ok'} className="text-[10px]">
                        {v[0] === 'V-0412' ? 'TAMPERED' : 'Verified'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Dual-Approved Bank Detail Remediation
                </CardTitle>
                <CardDescription className="text-xs">
                  Restore genuine bank routing with formal Finance Manager authorization via API.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">VENDOR ID</label>
                  <Input
                    value={updateVendorId}
                    onChange={(e) => setUpdateVendorId(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">RESTORE GENUINE ACCOUNT</label>
                  <Input
                    value={updateAccount}
                    onChange={(e) => setUpdateAccount(e.target.value)}
                    placeholder="•••• 4417"
                    className="text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">DUAL-APPROVAL REFERENCE</label>
                  <Input
                    value={updateApprovalRef}
                    onChange={(e) => setUpdateApprovalRef(e.target.value)}
                    placeholder="e.g. APR-1280"
                    className="text-xs font-mono"
                  />
                </div>
                <Button
                  onClick={handleUpdateBankDetails}
                  disabled={isUpdatingBank}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  {isUpdatingBank ? 'Submitting to API...' : 'Submit Dual-Approved Restoration'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 3: Invoices */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Inbound Vendor Invoices
                </CardTitle>
                <CardDescription className="text-xs">
                  Pending and scheduled payables for shipment handling and packaging.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => setIsAddInvoiceOpen(true)}
                className="bg-slate-900 hover:bg-slate-800 text-white text-xs shrink-0"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add invoice
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">Invoice ID</TableHead>
                    <TableHead>Vendor Legal Name</TableHead>
                    <TableHead className="w-[140px]">Gross Amount</TableHead>
                    <TableHead className="w-[140px]">Payment Due Date</TableHead>
                    <TableHead className="w-[200px]">Disbursement Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {liveInvoices.map((inv, i) => (
                    <TableRow
                      key={i}
                      className={inv[0] === 'INV-9081' ? 'bg-rose-100/70 font-semibold' : undefined}
                    >
                      <TableCell className="font-mono text-xs font-bold">
                        {inv[0]}
                        {inv[0] === 'INV-9081' && (
                          <div className="text-[9px] font-bold text-rose-800">
                            FRAUD TARGET
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-900">{inv[1]}</TableCell>
                      <TableCell className="font-bold text-xs font-mono">{inv[2]}</TableCell>
                      <TableCell className="font-mono text-xs">{inv[3]}</TableCell>
                      <TableCell>
                        <Badge
                          variant={inv[4].includes('HOLD') ? 'risk' : inv[4] === 'Paid' ? 'ok' : 'warn'}
                          className="text-[10px]"
                        >
                          {inv[4]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Payment Schedule */}
        <TabsContent value="schedule">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  Upcoming September 8th Payment Disbursement Run
                </CardTitle>
                <CardDescription className="text-xs">
                  Vendor disbursements executed twice monthly (8th and 23rd). Live batches from database.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-3">
                <Alert className="p-3 border-rose-300 bg-rose-50/90 text-rose-950">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <AlertDescription className="text-xs ml-1 leading-relaxed">
                    <strong>Payment Lock-in Confirmed:</strong> Exploit verification via <code>GET /v2/payments/scheduled</code> on 06 Sep at 01:36 UTC (<code>req-bb819dfe0c</code>) proved that <strong>Coastal Packaging Ltd (₹2,48,000)</strong> is locked in for disbursement to adversary account <code>****9083</code>.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  {/* Dynamic or fallback payment items */}
                  {livePayments.length > 0 ? (
                    livePayments.map((pay) => (
                      <div
                        key={pay.id}
                        className={`p-3 rounded-lg border flex items-center justify-between ${
                          pay.vendor.includes('Coastal')
                            ? 'border-rose-300 bg-rose-50/80'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {pay.pay_date} · {pay.vendor}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Batch: {pay.id} · Amount: <strong>₹{pay.amount}</strong>
                          </div>
                        </div>
                        <Badge
                          variant={pay.vendor.includes('Coastal') ? 'risk' : 'ok'}
                          className="text-[10px]"
                        >
                          {pay.vendor.includes('Coastal') ? 'PAYOUT ARMED' : pay.status}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="p-3 rounded-lg border border-rose-300 bg-rose-50/80 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-rose-950">08 Sep · Coastal Packaging Ltd (V-0412)</div>
                          <div className="text-[11px] text-rose-900 font-mono mt-0.5">
                            Amount: <strong>₹2,48,000</strong> · Destination: <code>•••• 9083</code> (Hijacked Beneficiary)
                          </div>
                        </div>
                        <Badge variant="risk" className="text-[10px]">PAYOUT ARMED</Badge>
                      </div>
                      <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-slate-900">08 Sep · Southern Haulage Corp (V-0104)</div>
                          <div className="text-[11px] text-slate-500 font-mono mt-0.5">Amount: ₹5,40,000 · Destination: •••• 3319</div>
                        </div>
                        <Badge variant="ok" className="text-[10px]">Scheduled</Badge>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="p-4">
                <CardTitle className="text-sm font-bold text-slate-900">
                  Queue Emergency Disbursement Run
                </CardTitle>
                <CardDescription className="text-xs">
                  Prepare out-of-cycle payments or submit scheduled payment batches via API.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">VENDOR</label>
                  <Input
                    value={schedVendor}
                    onChange={(e) => setSchedVendor(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">AMOUNT</label>
                  <Input
                    value={schedAmount}
                    onChange={(e) => setSchedAmount(e.target.value)}
                    className="text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">PAYMENT DATE</label>
                  <Input
                    type="date"
                    value={schedDate}
                    onChange={(e) => setSchedDate(e.target.value)}
                    className="text-xs"
                  />
                </div>
                <Button
                  onClick={handleSchedulePayment}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs"
                >
                  Confirm Scheduled Batch
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 5: Approvals */}
        <TabsContent value="approvals">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-slate-500" />
                Dual-Authorization Workflow Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                Control Failure: UI enforces dual authorization, but the <code>PATCH /v2/vendors/{'{id}'}/bank-details</code> API permitted <code>key-tb-07</code> to alter routing numbers without approval reference.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">Request Ref</TableHead>
                    <TableHead>Change Subject</TableHead>
                    <TableHead className="w-[160px]">Submitted By</TableHead>
                    <TableHead className="w-[160px]">Approval Status</TableHead>
                    <TableHead className="w-[140px]">Approval Ref</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    ['APR-3321', 'Bank detail change · Coastal Packaging (V-0412)', 'key-tb-07 (API)', 'Bypassed / Not recorded', 'NaN (BLANK)'],
                    ['APR-1257', 'Vendor address update · Northstar Freight (V-0388)', 'f.dsouza (UI)', 'Approved', 'APR-1257'],
                    ['BULK-0731', 'Month-end bank routing cleanup (12 vendors)', 'f.dsouza (Import)', 'Approved', 'BULK-0731'],
                    ['APR-3318', 'Invoice approval · Coastal Packaging (INV-9081)', 'Madhavi Sundar', 'Frozen for Review', 'PENDING'],
                  ].map((r, i) => (
                    <TableRow key={i} className={r[3].includes('Bypassed') ? 'bg-rose-100/70 font-semibold' : undefined}>
                      <TableCell className="font-mono text-xs font-bold">{r[0]}</TableCell>
                      <TableCell className="text-xs font-bold">{r[1]}</TableCell>
                      <TableCell><code className="text-xs">{r[2]}</code></TableCell>
                      <TableCell>
                        <Badge variant={r[3] === 'Approved' ? 'ok' : 'risk'} className="text-[10px]">
                          {r[3]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs font-bold">{r[4]}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Change History (E19) */}
        <TabsContent value="changes">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-500" />
                  Vendor Master Change Log (E19)
                </CardTitle>
                <CardDescription className="text-xs">
                  Connected to PostgreSQL audit log table. Row 311 represents the fraudulent modification.
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                Live Audit Logs Loaded: {liveChanges.length}
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[170px]">Change ID</TableHead>
                    <TableHead className="w-[120px]">Vendor</TableHead>
                    <TableHead className="w-[140px]">Changed By</TableHead>
                    <TableHead className="w-[100px]">Channel</TableHead>
                    <TableHead>Old → New Account</TableHead>
                    <TableHead className="w-[150px]">Approval Ref</TableHead>
                    <TableHead className="w-[140px]">Request ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Dynamic changes from backend */}
                  {liveChanges.map((chg) => (
                    <TableRow
                      key={chg.id}
                      className={
                        chg.vendor_id === 'V-0412' && !chg.approval_ref
                          ? 'bg-rose-100/80 font-bold'
                          : undefined
                      }
                    >
                      <TableCell className="font-mono text-xs font-bold">{chg.id}</TableCell>
                      <TableCell className="text-xs font-bold">{chg.vendor_id}</TableCell>
                      <TableCell>
                        <code className="text-xs">{chg.actor || 'anonymous'}</code>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={chg.actor?.includes('key') ? 'risk' : 'ok'}
                          className="text-[10px]"
                        >
                          {chg.actor?.includes('key') ? 'API' : 'UI'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {chg.old_account || '•••• 4417'} → <strong className="text-rose-950">{chg.new_account}</strong>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={chg.approval_ref ? 'ok' : 'risk'}
                          className="text-[10px]"
                        >
                          {chg.approval_ref || 'BLANK (NaN)'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-slate-500">
                        {chg.request_id || 'req-api'}
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Fallback Historical Seed Rows */}
                  {liveChanges.length === 0 && (
                    <>
                      <TableRow className="bg-rose-100/80 font-bold">
                        <TableCell className="font-mono text-xs text-rose-950">chg-8b9888c39b</TableCell>
                        <TableCell className="text-xs text-rose-950">V-0412</TableCell>
                        <TableCell><code className="text-xs text-rose-950 font-bold">key-tb-07</code></TableCell>
                        <TableCell><Badge variant="risk" className="text-[10px]">API</Badge></TableCell>
                        <TableCell className="font-mono text-xs text-rose-950">••••4417 → ••••9083</TableCell>
                        <TableCell><Badge variant="risk" className="text-[10px]">BLANK (NaN)</Badge></TableCell>
                        <TableCell className="font-mono text-xs text-rose-950">req-5f61b0de8</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-mono text-xs">chg-8b9888a101</TableCell>
                        <TableCell className="text-xs">V-0388</TableCell>
                        <TableCell><code className="text-xs">f.dsouza</code></TableCell>
                        <TableCell><Badge variant="ok" className="text-[10px]">UI</Badge></TableCell>
                        <TableCell className="text-xs">Coimbatore Depot Updated</TableCell>
                        <TableCell className="font-mono text-xs">APR-1257</TableCell>
                        <TableCell className="font-mono text-xs">172.16.8.31</TableCell>
                      </TableRow>
                    </>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 7: API Logs (E01/E18) */}
        <TabsContent value="apilogs">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4">
              <div>
                <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  Forensic API Call Stream (E01 & E18)
                </CardTitle>
                <CardDescription className="text-xs">
                  Chronological API interaction records from reconnaissance on 09 Aug to fraudulent PATCH on 03 Sep.
                </CardDescription>
              </div>
              <Badge variant="risk" className="text-xs shrink-0">
                Smoking Gun: req-5f61b0de8
              </Badge>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[140px]">Request ID</TableHead>
                    <TableHead className="w-[160px]">Timestamp (UTC)</TableHead>
                    <TableHead className="w-[130px]">Caller IP</TableHead>
                    <TableHead className="w-[120px]">Key ID</TableHead>
                    <TableHead>Method & Endpoint</TableHead>
                    <TableHead className="w-[90px]">Status</TableHead>
                    <TableHead className="w-[90px]">Records</TableHead>
                    <TableHead className="w-[200px]">Classification & Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {FORENSIC_API_LOGS.map((log) => (
                    <TableRow
                      key={log.requestId}
                      className={
                        log.phaseCategory === 'FRAUD EXECUTION'
                          ? 'bg-rose-100/80 font-bold'
                          : log.anomalyFlag
                          ? 'bg-rose-50/50'
                          : undefined
                      }
                    >
                      <TableCell className="font-mono text-xs font-bold">{log.requestId}</TableCell>
                      <TableCell className="font-mono text-xs">{log.timestampUtc}</TableCell>
                      <TableCell className="font-mono text-xs">{log.callerIp}</TableCell>
                      <TableCell><code className="text-xs font-bold">{log.apiKeyId}</code></TableCell>
                      <TableCell className="text-xs font-mono font-bold">
                        {log.method} {log.endpoint}
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.statusCode === 200 || log.statusCode === 204 ? 'ok' : 'risk'} className="text-[10px]">
                          {log.statusCode}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{log.recordsReturned}</TableCell>
                      <TableCell>
                        <Badge variant={log.anomalyFlag ? 'risk' : 'ok'} className="text-[10px]">
                          {log.phaseCategory}
                        </Badge>
                        <div className="text-[11px] text-slate-500 mt-0.5">{log.notes}</div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Register Vendor Dialog */}
      <Dialog
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register New Vendor"
        description="Add a new haulier or supplier into the LedgerOne master database."
      >
        <form onSubmit={handleRegisterVendor} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">VENDOR ID</label>
            <Input
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="e.g. V-0501"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">LEGAL ENTITY NAME</label>
            <Input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. Apex Marine Logistics Pvt Ltd"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">MASKED BANK ACCOUNT</label>
            <Input
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="•••• 0000"
            />
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Save Vendor
          </Button>
        </form>
      </Dialog>

      {/* Add Invoice Dialog */}
      <Dialog
        isOpen={isAddInvoiceOpen}
        onClose={() => setIsAddInvoiceOpen(false)}
        title="Add Vendor Invoice"
        description="Submit an invoice against an existing vendor account."
      >
        <form onSubmit={handleAddInvoice} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">INVOICE ID</label>
            <Input
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="e.g. INV-9095"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">VENDOR</label>
            <Input
              value={invoiceVendor}
              onChange={(e) => setInvoiceVendor(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">GROSS AMOUNT</label>
            <Input
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700">DUE DATE</label>
            <Input
              value={invoiceDue}
              onChange={(e) => setInvoiceDue(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs">
            Create Invoice
          </Button>
        </form>
      </Dialog>

      {/* Vendor Export Result Dialog */}
      <Dialog
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Reconnaissance Export Output (GET /api/v2/vendors/export)"
        description={`Export Ref: ${exportData?.export_id || 'exp-01'} · Total Records: ${exportData?.records || 0}`}
      >
        <div className="space-y-3">
          <div className="text-xs text-slate-600">
            This API endpoint was invoked by the adversary during reconnaissance to extract all active vendor IDs and routing numbers.
          </div>
          <div className="max-h-60 overflow-y-auto rounded bg-slate-900 p-3 font-mono text-xs text-emerald-400">
            <pre>{JSON.stringify(exportData, null, 2)}</pre>
          </div>
          <Button
            onClick={() => setIsExportModalOpen(false)}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
          >
            Close Output
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
