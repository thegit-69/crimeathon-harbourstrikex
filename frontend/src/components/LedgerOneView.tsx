import { useState } from 'react';
import type { InvoiceRecord, VendorRecord } from '../types';
import { APPS } from '../data/mockData';
import { Modal } from './Modal';

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
  const [activeTab, setActiveTab] = useState('Vendors');

  // Register vendor modal
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [bankAccount, setBankAccount] = useState('•••• 0000');

  // Update bank details form
  const [updateVendorId, setUpdateVendorId] = useState('V-0412');
  const [updateAccount, setUpdateAccount] = useState('•••• 0000');
  const [updateApprovalRef, setUpdateApprovalRef] = useState('APR-0000');

  // Add invoice modal
  const [isAddInvoiceOpen, setIsAddInvoiceOpen] = useState(false);
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceVendor, setInvoiceVendor] = useState('Coastal Packaging Ltd.');
  const [invoiceAmount, setInvoiceAmount] = useState('₹1,20,000');
  const [invoiceDue, setInvoiceDue] = useState('28 Nov 2026');

  // Schedule payment form
  const [schedVendor, setSchedVendor] = useState('Coastal Packaging Ltd.');
  const [schedAmount, setSchedAmount] = useState('₹ 0.00');
  const [schedDate, setSchedDate] = useState('');

  const handleRegisterVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId.trim() || !vendorName.trim()) {
      showMessage('Vendor ID and name are required.');
      return;
    }
    onAddVendor([
      vendorId.trim(),
      vendorName.trim(),
      bankAccount.trim() || '•••• 0000',
      'Active',
      'Pending review',
    ]);
    setIsRegisterOpen(false);
    setVendorId('');
    setVendorName('');
    setBankAccount('•••• 0000');
    showMessage('Vendor registered in demo.');
  };

  const handleAddInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const id = invoiceId.trim() || `INV-${Math.floor(9090 + Math.random() * 50)}`;
    onAddInvoice([id, invoiceVendor, invoiceAmount, invoiceDue, 'Awaiting approval']);
    setIsAddInvoiceOpen(false);
    setInvoiceId('');
    showMessage('Invoice added to register.');
  };

  return (
    <div>
      <div className="head">
        <div>
          <div className="eyebrow">BUSINESS APPLICATION</div>
          <h1>{APPS.ledger.name}</h1>
          <p className="muted">{APPS.ledger.desc}</p>
        </div>
        <span className="pill">● Simulated system</span>
      </div>

      <div className="tabs">
        {APPS.ledger.tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            className={tab === activeTab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div id="body">
        {activeTab === 'Vendors' && (
          <div className="panel">
            <div className="toolbar">
              <h3>Vendor directory</h3>
              <button
                type="button"
                className="btn primary"
                onClick={() => setIsRegisterOpen(true)}
              >
                ＋ Register vendor
              </button>
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Vendor ID</th>
                    <th>Vendor name</th>
                    <th>Bank account</th>
                    <th>Status</th>
                    <th>Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((v, i) => (
                    <tr key={i}>
                      <td><code>{v[0]}</code></td>
                      <td><b>{v[1]}</b></td>
                      <td><code>{v[2]}</code></td>
                      <td><span className="badge ok">{v[3]}</span></td>
                      <td>
                        <span
                          className={`badge ${
                            v[4] === 'Approved' ? 'ok' : 'warn'
                          }`}
                        >
                          {v[4]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Bank Details' && (
          <div className="grid two">
            <div className="panel">
              <h3>Vendor bank details</h3>
              {vendors.map((v, i) => (
                <div key={i} className="row">
                  <b>
                    {v[1]}
                    <small>{v[0]} · {v[2]}</small>
                  </b>
                  <span className="badge warn">Review</span>
                </div>
              ))}
            </div>

            <div className="panel">
              <h3>Update bank details</h3>
              <div className="field">
                <label>VENDOR ID</label>
                <input
                  value={updateVendorId}
                  onChange={(e) => setUpdateVendorId(e.target.value)}
                />
              </div>
              <div className="field">
                <label>NEW ACCOUNT (DEMO)</label>
                <input
                  value={updateAccount}
                  onChange={(e) => setUpdateAccount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>APPROVAL REFERENCE</label>
                <input
                  value={updateApprovalRef}
                  onChange={(e) => setUpdateApprovalRef(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={() => showMessage('Change submitted to simulated approval workflow.')}
              >
                Submit change
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Invoices' && (
          <div className="panel">
            <div className="toolbar">
              <h3>Invoice management</h3>
              <button
                type="button"
                className="btn primary"
                onClick={() => setIsAddInvoiceOpen(true)}
              >
                ＋ Add invoice
              </button>
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Invoice</th>
                    <th>Vendor</th>
                    <th>Amount</th>
                    <th>Due date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv, i) => (
                    <tr key={i}>
                      <td><code>{inv[0]}</code></td>
                      <td><b>{inv[1]}</b></td>
                      <td><b>{inv[2]}</b></td>
                      <td>{inv[3]}</td>
                      <td>
                        <span
                          className={`badge ${
                            inv[4] === 'Paid' ? 'ok' : inv[4] === 'Scheduled' ? 'warn' : 'risk'
                          }`}
                        >
                          {inv[4]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Payment Schedule' && (
          <div className="grid two">
            <div className="panel">
              <h3>Upcoming payment schedule</h3>
              <div className="activity">
                <b>20 Nov · Northstar Freight</b>
                <div className="small">₹86,500 · Scheduled</div>
              </div>
              <div className="activity">
                <b>22 Nov · Coastal Packaging</b>
                <div className="small">₹2,48,000 · Awaiting approval</div>
              </div>
              <div className="activity">
                <b>25 Nov · Harbor Office Supplies</b>
                <div className="small">₹32,800 · Draft</div>
              </div>
            </div>

            <div className="panel">
              <h3>Schedule payment</h3>
              <div className="field">
                <label>VENDOR</label>
                <input
                  value={schedVendor}
                  onChange={(e) => setSchedVendor(e.target.value)}
                />
              </div>
              <div className="field">
                <label>AMOUNT</label>
                <input
                  value={schedAmount}
                  onChange={(e) => setSchedAmount(e.target.value)}
                />
              </div>
              <div className="field">
                <label>PAYMENT DATE</label>
                <input
                  type="date"
                  value={schedDate}
                  onChange={(e) => setSchedDate(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={() => showMessage('Payment scheduled in demo. No money is transferred.')}
              >
                Schedule payment
              </button>
            </div>
          </div>
        )}

        {activeTab === 'Approvals' && (
          <div className="panel">
            <h3>Approval workflow</h3>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Request</th>
                    <th>Type</th>
                    <th>Submitted by</th>
                    <th>Approval stage</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['APR-3321', 'Bank detail change · V-0412', 'Finance IT', 'Pending review', 'Review'],
                    ['APR-3318', 'Invoice · INV-9081', 'Accounts Payable', 'Manager approval', 'Review'],
                    ['APR-3311', 'Payment batch · PB-908', 'Finance Ops', 'Approved', 'View'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td><code>{r[0]}</code></td>
                      <td><b>{r[1]}</b></td>
                      <td>{r[2]}</td>
                      <td>
                        <span className={`badge ${r[3] === 'Approved' ? 'ok' : 'warn'}`}>
                          {r[3]}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn ghost"
                          onClick={() => showMessage(`Approval request ${r[0]} opened for review.`)}
                        >
                          {r[4]}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Change History' && (
          <div className="panel">
            <h3>Change history</h3>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Actor</th>
                    <th>Vendor</th>
                    <th>Field</th>
                    <th>Change</th>
                    <th>Approval</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['03 Sep 09:18', 'key-tb-07', 'V-0412', 'bank_account', '••••4417 → ••••9083', 'Not recorded'],
                    ['02 Sep 14:30', 'finance.user', 'V-0388', 'address', 'Updated', 'APR-3312'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r[0]}</td>
                      <td><b>{r[1]}</b></td>
                      <td><code>{r[2]}</code></td>
                      <td><code>{r[3]}</code></td>
                      <td><b>{r[4]}</b></td>
                      <td><span className={`badge ${r[5] === 'Not recorded' ? 'risk' : 'ok'}`}>{r[5]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Register Vendor Modal */}
      <Modal
        title="Register vendor"
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      >
        <form onSubmit={handleRegisterVendor}>
          <div className="field">
            <label>VENDOR ID</label>
            <input
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="e.g. V-0501"
              autoFocus
            />
          </div>
          <div className="field">
            <label>VENDOR NAME</label>
            <input
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
              placeholder="e.g. Apex Marine Logistics"
            />
          </div>
          <div className="field">
            <label>MASKED BANK ACCOUNT</label>
            <input
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="•••• 0000"
            />
          </div>
          <button type="submit" className="btn primary full">
            Register
          </button>
        </form>
      </Modal>

      {/* Add Invoice Modal */}
      <Modal
        title="Add invoice"
        isOpen={isAddInvoiceOpen}
        onClose={() => setIsAddInvoiceOpen(false)}
      >
        <form onSubmit={handleAddInvoice}>
          <div className="field">
            <label>INVOICE ID</label>
            <input
              value={invoiceId}
              onChange={(e) => setInvoiceId(e.target.value)}
              placeholder="e.g. INV-9095"
              autoFocus
            />
          </div>
          <div className="field">
            <label>VENDOR</label>
            <input
              value={invoiceVendor}
              onChange={(e) => setInvoiceVendor(e.target.value)}
            />
          </div>
          <div className="field">
            <label>AMOUNT</label>
            <input
              value={invoiceAmount}
              onChange={(e) => setInvoiceAmount(e.target.value)}
            />
          </div>
          <div className="field">
            <label>DUE DATE</label>
            <input
              value={invoiceDue}
              onChange={(e) => setInvoiceDue(e.target.value)}
            />
          </div>
          <button type="submit" className="btn primary full">
            Create invoice
          </button>
        </form>
      </Modal>
    </div>
  );
}
