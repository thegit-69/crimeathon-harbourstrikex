import { useState } from 'react';
import type { DocRecord, KeyRecord } from '../types';
import { APPS } from '../data/mockData';
import { Modal } from './Modal';

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
  const [activeTab, setActiveTab] = useState('Folders & Documents');
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);

  const folders = [
    'Finance',
    'Finance / Vendor Bank Details',
    'Finance / Payment Runs',
    'Finance / Statements',
    'Customer Documents',
    'Shipment Records',
    'Support Attachments',
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
      'Finance / Vendor Bank Details',
      ext,
      'Restricted',
    ]);
    setIsAddDocOpen(false);
    setSelectedUploadFile(null);
    showMessage('Document metadata added to demo register.');
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
    showMessage('Demo API key generated.');
  };

  return (
    <div>
      <div className="head">
        <div>
          <div className="eyebrow">BUSINESS APPLICATION</div>
          <h1>{APPS.blue.name}</h1>
          <p className="muted">{APPS.blue.desc}</p>
        </div>
        <span className="pill">● Simulated system</span>
      </div>

      <div className="tabs">
        {APPS.blue.tabs.map((tab) => (
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
        {(activeTab === 'Folders & Documents' || activeTab === 'Finance Folder') && (
          <div className="grid two">
            <div className="panel">
              <h3>Folder explorer</h3>
              {folders.map((f, i) => (
                <div key={i} className="row">
                  <b>▰ {f}</b>
                  <button
                    type="button"
                    className="btn ghost"
                    onClick={() => showMessage(`Folder opened: ${f}`)}
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>

            <div className="panel">
              <div className="toolbar">
                <h3>Documents</h3>
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => setIsAddDocOpen(true)}
                >
                  ＋ Add document
                </button>
              </div>

              <div className="scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Folder</th>
                      <th>Type</th>
                      <th>Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {docs.map((doc, idx) => (
                      <tr key={idx}>
                        <td><b>{doc[0]}</b></td>
                        <td>{doc[1]}</td>
                        <td><span className="badge">{doc[2]}</span></td>
                        <td>
                          <span
                            className={`badge ${
                              doc[3] === 'Restricted' ? 'risk' : 'warn'
                            }`}
                          >
                            {doc[3]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'API Keys' && (
          <div className="panel">
            <div className="toolbar">
              <h3>Storage API keys</h3>
              <button
                type="button"
                className="btn primary"
                onClick={handleGenerateKey}
              >
                ＋ Generate key
              </button>
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Key ID</th>
                    <th>Owner</th>
                    <th>Scope</th>
                    <th>Expiry</th>
                    <th>IP restriction</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {keys.map((k, i) => (
                    <tr key={i}>
                      <td><code>{k[0]}</code></td>
                      <td><b>{k[1]}</b></td>
                      <td><code>{k[2]}</code></td>
                      <td>{k[3]}</td>
                      <td>{k[4]}</td>
                      <td>
                        <span className={`badge ${k[5] === 'Active' ? 'ok' : 'risk'}`}>
                          {k[5]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Permissions' && (
          <div className="panel">
            <h3>Folder-level permissions</h3>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Folder</th>
                    <th>Role / Principal</th>
                    <th>Permission</th>
                    <th>Last reviewed</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Finance / Vendor Bank Details', 'Finance Team', 'Read / Write', '12 Jun 2026'],
                    ['Finance / Statements', 'Finance Team', 'Read', '12 Jun 2026'],
                    ['Finance / Payment Runs', 'Payment Operations', 'Read / Write', '12 Jun 2026'],
                    ['Customer Documents', 'Support Ops', 'Read', '01 Sep 2026'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td><b>{r[0]}</b></td>
                      <td>{r[1]}</td>
                      <td><code>{r[2]}</code></td>
                      <td>{r[3]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Access Logs' && (
          <div className="panel">
            <h3>Document access logs</h3>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Principal</th>
                    <th>Document / Folder</th>
                    <th>Source</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['03 Sep 09:18', 'key:bvk-7f3a', 'Finance / Bank Instructions', '198.18.7.23', 'Read'],
                    ['02 Sep 16:42', 'finance.user', 'Finance / Statements', '10.20.4.18', 'Read'],
                    ['02 Sep 11:05', 'support.agent', 'Customer Documents', '172.16.9.40', 'Read'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r[0]}</td>
                      <td><b>{r[1]}</b></td>
                      <td>{r[2]}</td>
                      <td><code>{r[3]}</code></td>
                      <td><span className="badge">{r[4]}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Document Modal */}
      <Modal
        title="Add document"
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
      >
        <form onSubmit={handleSaveUpload}>
          <div className="field">
            <label>SELECT FILE</label>
            <input
              type="file"
              onChange={(e) => setSelectedUploadFile(e.target.files ? e.target.files[0] : null)}
            />
          </div>
          <button type="submit" className="btn primary full">
            Add to register
          </button>
          <p className="small" style={{ marginTop: '10px' }}>
            File is not uploaded; only its name is added to the demo register.
          </p>
        </form>
      </Modal>
    </div>
  );
}
