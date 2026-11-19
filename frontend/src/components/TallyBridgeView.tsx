import { useState } from 'react';
import type { KeyRecord, SyncJobRecord } from '../types';
import { APPS } from '../data/mockData';
import { Modal } from './Modal';

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
  const [activeTab, setActiveTab] = useState('API Keys');

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
  const [hostLabel, setHostLabel] = useState('build-agent-02');
  const [hostEnv, setHostEnv] = useState('Isolated simulation');

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
    showMessage('Demo API key created.');
  };

  const handleTriggerSync = () => {
    const newId = `SYNC-${Math.floor(8825 + Math.random() * 50)}`;
    onRunSync([newId, 'Manual ad-hoc sync', 'Enterprise Bus', 'Just now', 'Completed']);
    showMessage('Sync job queued in simulation.');
  };

  return (
    <div>
      <div className="head">
        <div>
          <div className="eyebrow">BUSINESS APPLICATION</div>
          <h1>{APPS.tally.name}</h1>
          <p className="muted">{APPS.tally.desc}</p>
        </div>
        <span className="pill">● Simulated system</span>
      </div>

      <div className="tabs">
        {APPS.tally.tabs.map((tab) => (
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
        {activeTab === 'API Keys' && (
          <div className="panel">
            <div className="toolbar">
              <h3>API key management</h3>
              <button
                type="button"
                className="btn primary"
                onClick={() => setIsAddKeyOpen(true)}
              >
                ＋ Create API key
              </button>
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Key ID</th>
                    <th>Owner</th>
                    <th>Permissions</th>
                    <th>Token expiry</th>
                    <th>IP allowlist</th>
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

        {activeTab === 'Service Accounts' && (
          <div className="panel">
            <div className="toolbar">
              <h3>Service accounts</h3>
              <button
                type="button"
                className="btn primary"
                onClick={() => setIsAddAccountOpen(true)}
              >
                ＋ Add account
              </button>
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Account</th>
                    <th>Owner team</th>
                    <th>Purpose</th>
                    <th>Last used</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['tb-sync-svc', 'Finance IT', 'Vendor and ticket sync', '19 Nov 08:30', 'Active'],
                    ['bv-archive-svc', 'IT Operations', 'Document archive', '19 Nov 02:00', 'Active'],
                    ['legacy-export-svc', 'Support Ops', 'Legacy exports', '11 Jan 2025', 'Disabled'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td><code>{r[0]}</code></td>
                      <td><b>{r[1]}</b></td>
                      <td>{r[2]}</td>
                      <td>{r[3]}</td>
                      <td>
                        <span className={`badge ${r[4] === 'Active' ? 'ok' : 'risk'}`}>
                          {r[4]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Connected Apps' && (
          <div className="panel">
            <div className="toolbar">
              <h3>Connected applications</h3>
              <button
                type="button"
                className="btn primary"
                onClick={() => setIsConnectAppOpen(true)}
              >
                ＋ Connect app
              </button>
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Application</th>
                    <th>Environment</th>
                    <th>Account</th>
                    <th>Permissions</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['LedgerOne', 'Simulated', 'tb-sync-svc', 'Vendor read/write', 'Connected'],
                    ['HelpDeskr', 'Simulated', 'tb-sync-svc', 'Ticket sync', 'Connected'],
                    ['BlueVault', 'Simulated', 'bv-archive-svc', 'Document read', 'Connected'],
                    ['Build Host', 'Internal lab', 'build-agent-02', 'Deploy metadata', 'Review'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td><b>{r[0]}</b></td>
                      <td>{r[1]}</td>
                      <td><code>{r[2]}</code></td>
                      <td>{r[3]}</td>
                      <td>
                        <span className={`badge ${r[4] === 'Connected' ? 'ok' : 'warn'}`}>
                          {r[4]}
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
            <h3>Integration permissions</h3>
            <div className="notice">Review scopes and apply least-privilege access.</div>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Principal</th>
                    <th>Application</th>
                    <th>Granted scope</th>
                    <th>Recommended scope</th>
                    <th>Review</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['key-tb-07', 'LedgerOne', 'read:write all-modules', 'vendor:read, vendor:update', 'Over-privileged'],
                    ['bvk-7f3a', 'BlueVault', 'read:all-folders', 'specific folder access', 'Over-privileged'],
                    ['tb-sync-svc', 'HelpDeskr', 'ticket:read/write', 'ticket:sync', 'Review'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td><code>{r[0]}</code></td>
                      <td><b>{r[1]}</b></td>
                      <td><code>{r[2]}</code></td>
                      <td>{r[3]}</td>
                      <td>
                        <span className={`badge ${r[4] === 'Over-privileged' ? 'risk' : 'warn'}`}>
                          {r[4]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Token & IP Controls' && (
          <div className="grid two">
            <div className="panel">
              <h3>Token policy</h3>
              <div className="field">
                <label>DEFAULT TOKEN LIFETIME</label>
                <select
                  value={tokenLifetime}
                  onChange={(e) => setTokenLifetime(e.target.value)}
                >
                  <option>90 days</option>
                  <option>30 days</option>
                  <option>7 days</option>
                </select>
              </div>
              <div className="field">
                <label>IP ALLOWLIST</label>
                <textarea
                  rows={3}
                  value={ipAllowlist}
                  onChange={(e) => setIpAllowlist(e.target.value)}
                  placeholder="10.20.4.0/24"
                />
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={() => showMessage('Token policy saved in demo.')}
              >
                Save policy
              </button>
            </div>

            <div className="panel">
              <h3>Policy checklist</h3>
              {[
                'Token expiry configured',
                'IP allowlisting enabled',
                'Least-privilege scope applied',
                'Key owner assigned',
                'Last review recorded',
              ].map((item, i) => (
                <div key={i} className="row">
                  <b>{item}</b>
                  <span className="badge warn">Review required</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Sync Jobs' && (
          <div className="panel">
            <div className="toolbar">
              <h3>Synchronization jobs</h3>
              <button
                type="button"
                className="btn primary"
                onClick={handleTriggerSync}
              >
                ＋ Run sync
              </button>
            </div>

            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Job ID</th>
                    <th>Job name</th>
                    <th>Target</th>
                    <th>Last run</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((j, i) => (
                    <tr key={i}>
                      <td><code>{j[0]}</code></td>
                      <td><b>{j[1]}</b></td>
                      <td>{j[2]}</td>
                      <td>{j[3]}</td>
                      <td>
                        <span
                          className={`badge ${
                            j[4] === 'Completed' ? 'ok' : 'warn'
                          }`}
                        >
                          {j[4]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'Build Host' && (
          <div className="grid two">
            <div className="panel">
              <h3>Build host status</h3>
              <div className="stat" style={{ fontSize: '22px' }}>build-agent-02</div>
              <span className="badge ok">Online · simulated</span>
              <div className="notice">
                Sample host data only. No host discovery or network connection is performed.
              </div>
              <div className="activity">
                <b>Last heartbeat</b>
                <div className="small">19 Nov 2026 · 09:00</div>
              </div>
              <div className="activity">
                <b>Agent version</b>
                <div className="small">2.8.4-demo</div>
              </div>
            </div>

            <div className="panel">
              <h3>Build configuration</h3>
              <div className="field">
                <label>HOST LABEL</label>
                <input
                  value={hostLabel}
                  onChange={(e) => setHostLabel(e.target.value)}
                />
              </div>
              <div className="field">
                <label>ENVIRONMENT</label>
                <select
                  value={hostEnv}
                  onChange={(e) => setHostEnv(e.target.value)}
                >
                  <option>Isolated simulation</option>
                  <option>Staging</option>
                </select>
              </div>
              <button
                type="button"
                className="btn primary"
                onClick={() => showMessage('Build settings saved.')}
              >
                Save configuration
              </button>
            </div>
          </div>
        )}

        {activeTab === 'API Activity' && (
          <div className="panel">
            <h3>API activity logs</h3>
            <div className="scroll">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Credential</th>
                    <th>Source</th>
                    <th>Method / Endpoint</th>
                    <th>Status</th>
                    <th>Records</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['12 Aug 10:04', 'key-tb-07', '198.18.7.41', 'POST /v2/vendors/export', '200', '9,840'],
                    ['12 Aug 10:06', 'key-tb-07', '198.18.7.58', 'GET /v2/exports/9931', '200', '9,840'],
                    ['12 Aug 10:08', 'key-tb-07', '198.18.7.41', 'DELETE /v2/exports/9931', '204', '—'],
                    ['03 Sep 09:18', 'key-tb-07', '10.20.4.77', 'PATCH /v2/vendors/V-0412/bank-details', '200', '1'],
                  ].map((r, i) => (
                    <tr key={i}>
                      <td>{r[0]}</td>
                      <td><code>{r[1]}</code></td>
                      <td><code>{r[2]}</code></td>
                      <td><b>{r[3]}</b></td>
                      <td><span className="badge ok">{r[4]}</span></td>
                      <td>{r[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create API Key Modal */}
      <Modal
        title="Create API key"
        isOpen={isAddKeyOpen}
        onClose={() => setIsAddKeyOpen(false)}
      >
        <form onSubmit={handleCreateKey}>
          <div className="field">
            <label>OWNER</label>
            <input
              value={keyOwner}
              onChange={(e) => setKeyOwner(e.target.value)}
              placeholder="e.g. Finance IT"
              autoFocus
            />
          </div>
          <div className="field">
            <label>SCOPE</label>
            <input
              value={keyScope}
              onChange={(e) => setKeyScope(e.target.value)}
            />
          </div>
          <div className="field">
            <label>TOKEN EXPIRY</label>
            <select
              value={keyExpiry}
              onChange={(e) => setKeyExpiry(e.target.value)}
            >
              <option>90 days</option>
              <option>30 days</option>
              <option>No expiry</option>
            </select>
          </div>
          <div className="field">
            <label>IP ALLOWLIST</label>
            <input
              value={keyIp}
              onChange={(e) => setKeyIp(e.target.value)}
            />
          </div>
          <button type="submit" className="btn primary full">
            Create key
          </button>
        </form>
      </Modal>

      {/* Add Account Modal */}
      <Modal
        title="Add service account"
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
      >
        <div>
          <div className="field">
            <label>ACCOUNT NAME</label>
            <input
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g. etl-pipeline-svc"
              autoFocus
            />
          </div>
          <div className="field">
            <label>OWNER TEAM</label>
            <input
              value={accountTeam}
              onChange={(e) => setAccountTeam(e.target.value)}
            />
          </div>
          <div className="field">
            <label>PURPOSE</label>
            <input
              value={accountPurpose}
              onChange={(e) => setAccountPurpose(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn primary full"
            onClick={() => {
              if (!accountName.trim()) {
                showMessage('Account name is required.');
                return;
              }
              setIsAddAccountOpen(false);
              setAccountName('');
              showMessage('Service account registered.');
            }}
          >
            Create service account
          </button>
        </div>
      </Modal>

      {/* Connect App Modal */}
      <Modal
        title="Connect application"
        isOpen={isConnectAppOpen}
        onClose={() => setIsConnectAppOpen(false)}
      >
        <div>
          <div className="field">
            <label>APPLICATION NAME</label>
            <input
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="e.g. AuditLogStreamer"
              autoFocus
            />
          </div>
          <div className="field">
            <label>ENVIRONMENT</label>
            <select
              value={appEnv}
              onChange={(e) => setAppEnv(e.target.value)}
            >
              <option>Simulated</option>
              <option>Production Lab</option>
              <option>Staging</option>
            </select>
          </div>
          <button
            type="button"
            className="btn primary full"
            onClick={() => {
              if (!appName.trim()) {
                showMessage('Application name is required.');
                return;
              }
              setIsConnectAppOpen(false);
              setAppName('');
              showMessage(`Application "${appName}" connected.`);
            }}
          >
            Connect
          </button>
        </div>
      </Modal>
    </div>
  );
}
