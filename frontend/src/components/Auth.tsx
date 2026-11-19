import { useState } from 'react';
import { ShieldLogo } from './ShieldLogo';
import { authApi, setToken } from '../services/api';

interface AuthProps {
  onSignIn: (username: string) => void;
  showMessage: (msg: string) => void;
  backendConnected?: boolean | null;
  onCheckHealth?: () => void;
}

interface CharacterPreset {
  username: string;
  role: string;
  pass: string;
  desc: string;
}

const CASE_CHARACTERS: CharacterPreset[] = [
  { username: 'a.kapoor', role: 'IT Admin', pass: 'admin123', desc: 'Infrastructure & Key Admin' },
  { username: 'm.sundar', role: 'Finance Mgr', pass: 'user123', desc: 'Vendor & Payment Approvals' },
  { username: 'f.dsouza', role: 'Sr Accountant', pass: 'user123', desc: 'Ledger & Disbursements' },
  { username: 's.iyer', role: 'Support Lead', pass: 'user123', desc: 'Tickets & Export Queue' },
  { username: 'r.menon', role: 'Terminated', pass: 'user123', desc: 'Ex-Accounts Clerk' },
  { username: 'demo_operator', role: 'Operator', pass: 'demo123', desc: 'Simulation Sandbox' },
];

export function Auth({ onSignIn, showMessage, backendConnected, onCheckHealth }: AuthProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loginUser, setLoginUser] = useState('a.kapoor');
  const [loginPass, setLoginPass] = useState('admin123');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const getUsers = (): Record<string, string> => {
    try {
      const stored = localStorage.getItem('hsUsers');
      if (!stored) {
        const defaults: Record<string, string> = {
          'demo_operator': 'demo123',
          'a.kapoor': 'admin123',
          'm.sundar': 'user123',
          'f.dsouza': 'user123',
          's.iyer': 'user123',
          'r.menon': 'user123',
        };
        localStorage.setItem('hsUsers', JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(stored);
    } catch {
      return {};
    }
  };

  const handleSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = loginUser.trim();
    const p = loginPass;
    if (!u) {
      showMessage('Please enter an operator username.');
      return;
    }

    setLoading(true);

    // 1. Try real backend API
    try {
      const res = await authApi.login(u, p);
      if (res && res.access_token) {
        setToken(res.access_token);
        localStorage.setItem('hsCurrentUser', u);
        showMessage(`Authenticated with API as ${u}`);
        onSignIn(u);
        return;
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      // Check if backend rejected credentials (401)
      if (errorMsg.includes('401') || errorMsg.includes('credentials')) {
        showMessage('Invalid credentials. Check username and password.');
        setLoading(false);
        return;
      }
      // If backend is unreachable or disconnected, attempt offline fallback
    }

    // 2. Offline Simulation Fallback
    const users = getUsers();
    const preset = CASE_CHARACTERS.find((c) => c.username === u && c.pass === p);
    if ((users[u] && users[u] === p) || preset) {
      localStorage.setItem('hsCurrentUser', u);
      showMessage(`Logged in via offline simulation mode as ${u}`);
      onSignIn(u);
    } else {
      showMessage('API server unreachable and local fallback credentials did not match.');
    }
    setLoading(false);
  };

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = regUser.trim();
    const p = regPass;
    if (!u || !p) {
      showMessage('Please enter both username and password.');
      return;
    }
    if (p !== regConfirm) {
      showMessage('Passwords do not match.');
      return;
    }
    const users = getUsers();
    if (users[u]) {
      showMessage('Username already exists in local database.');
      return;
    }
    users[u] = p;
    localStorage.setItem('hsUsers', JSON.stringify(users));
    setLoginUser(u);
    setLoginPass(p);
    setView('login');
    showMessage('Local operator account created. You may now sign in.');
  };

  const selectCharacter = (c: CharacterPreset) => {
    setLoginUser(c.username);
    setLoginPass(c.pass);
  };

  return (
    <section className="auth">
      <div className="brand">
        <div className="brand-mark" aria-label="HARBORSTRIKE shield mark">
          <ShieldLogo />
        </div>
        <div className="brand-title">HARBORSTRIKE</div>
        <p className="text-xs text-slate-600 max-w-md leading-relaxed mt-1">
          Synthetic enterprise operations & controlled OFFENSE attack simulation environment for Case <strong className="text-slate-900">CR-26-047</strong> (Harbor & Finch Freight Pvt. Ltd.).
        </p>

        <div className="brand-apps mt-4">
          <div className="brand-app">
            <i>HD</i>
            <span><strong>HelpDeskr</strong> — Support Tickets, Attachments & Exports</span>
          </div>
          <div className="brand-app">
            <i>BV</i>
            <span><strong>BlueVault</strong> — Document Storage & Finance Repositories</span>
          </div>
          <div className="brand-app">
            <i>LO</i>
            <span><strong>LedgerOne</strong> — Vendor Master, Invoices & Disbursements</span>
          </div>
          <div className="brand-app">
            <i>TB</i>
            <span><strong>TallyBridge</strong> — Machine API Credentials & Nightly Sync</span>
          </div>
          <div className="brand-app">
            <i>⚡</i>
            <span><strong>Exploit & Attack Vectors</strong> — Controlled Offense Workspace</span>
          </div>
        </div>
      </div>

      <div className="authbox">
        <div className="card">
          {/* Connection Status Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '7px 11px',
              marginBottom: '16px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              background:
                backendConnected === true
                  ? 'rgba(34, 197, 94, 0.1)'
                  : backendConnected === false
                  ? 'rgba(239, 68, 68, 0.1)'
                  : 'rgba(148, 163, 184, 0.1)',
              color:
                backendConnected === true
                  ? '#15803d'
                  : backendConnected === false
                  ? '#b91c1c'
                  : '#64748b',
              border: `1px solid ${
                backendConnected === true
                  ? 'rgba(34, 197, 94, 0.3)'
                  : backendConnected === false
                  ? 'rgba(239, 68, 68, 0.3)'
                  : 'rgba(148, 163, 184, 0.25)'
              }`,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor:
                    backendConnected === true
                      ? '#22c55e'
                      : backendConnected === false
                      ? '#ef4444'
                      : '#94a3b8',
                  display: 'inline-block',
                  boxShadow:
                    backendConnected === true
                      ? '0 0 6px #22c55e'
                      : backendConnected === false
                      ? '0 0 6px #ef4444'
                      : 'none',
                }}
              />
              <span>
                {backendConnected === true
                  ? 'FastAPI Backend Online (Port 8000)'
                  : backendConnected === false
                  ? 'Backend Disconnected (Offline Fallback)'
                  : 'Checking Backend Connection...'}
              </span>
            </div>
            {onCheckHealth && (
              <button
                type="button"
                onClick={onCheckHealth}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 2px',
                  fontSize: '12px',
                  color: 'inherit',
                  opacity: 0.8,
                }}
                title="Check API Health"
              >
                ↻
              </button>
            )}
          </div>

          {view === 'login' ? (
            <div>
              <div className="eyebrow">OPERATOR AUTHENTICATION</div>
              <h2>Sign in</h2>
              <p className="muted">Enter your operator credentials or pick a simulation actor below.</p>

              {/* Character Quick-Select Badges */}
              <div style={{ marginTop: '12px', marginBottom: '8px' }}>
                <span
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: '#64748b',
                    marginBottom: '6px',
                  }}
                >
                  QUICK SELECT ACTOR (CASE CR-26-047)
                </span>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '6px',
                  }}
                >
                  {CASE_CHARACTERS.map((char) => {
                    const isSelected = loginUser === char.username;
                    return (
                      <button
                        key={char.username}
                        type="button"
                        onClick={() => selectCharacter(char)}
                        style={{
                          textAlign: 'left',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          background: isSelected ? '#1e293b' : '#f1f5f9',
                          color: isSelected ? '#fff' : '#1e293b',
                          border: isSelected ? '1px solid #0f172a' : '1px solid #cbd5e1',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ fontWeight: 800 }}>{char.username}</div>
                        <div
                          style={{
                            fontSize: '9.5px',
                            color: isSelected ? '#94a3b8' : '#64748b',
                          }}
                        >
                          {char.role}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSignIn} className="mt-4">
                <div className="field">
                  <label htmlFor="login-username">OPERATOR USERNAME</label>
                  <input
                    id="login-username"
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Enter username"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label htmlFor="login-password">PASSWORD</label>
                  <input
                    id="login-password"
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                  />
                </div>
                <button
                  type="submit"
                  className="btn primary full"
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign in to HARBORSTRIKE'}
                </button>
              </form>
              <p className="muted" style={{ textAlign: 'center', marginTop: '16px' }}>
                Need a custom login?{' '}
                <button
                  type="button"
                  className="link"
                  onClick={() => setView('register')}
                >
                  Create demo account
                </button>
              </p>
            </div>
          ) : (
            <div>
              <div className="eyebrow">NEW SIMULATION USER</div>
              <h2>Create demo account</h2>
              <p className="muted">Create a local browser-stored simulation account.</p>
              <form onSubmit={handleRegister} className="mt-4">
                <div className="field">
                  <label htmlFor="reg-username">OPERATOR USERNAME</label>
                  <input
                    id="reg-username"
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    placeholder="Choose username"
                    autoComplete="username"
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label htmlFor="reg-password">PASSWORD</label>
                  <input
                    id="reg-password"
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Create password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="field">
                  <label htmlFor="reg-confirm">CONFIRM PASSWORD</label>
                  <input
                    id="reg-confirm"
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="btn primary full">
                  Create Account & Sign In
                </button>
              </form>
              <p className="muted" style={{ textAlign: 'center', marginTop: '16px' }}>
                Already registered?{' '}
                <button
                  type="button"
                  className="link"
                  onClick={() => setView('login')}
                >
                  Sign in
                </button>
              </p>
            </div>
          )}

          <div className="note">
            <strong>Case CR-26-047 Environment:</strong> Connects to FastAPI backend with JWT tokens. If backend is offline, the interface seamlessly falls back to offline simulation.
          </div>
        </div>
      </div>
    </section>
  );
}
