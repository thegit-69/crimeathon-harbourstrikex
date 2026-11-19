import { useState } from 'react';
import { ShieldLogo } from './ShieldLogo';

interface AuthProps {
  onSignIn: (username: string) => void;
  showMessage: (msg: string) => void;
}

export function Auth({ onSignIn, showMessage }: AuthProps) {
  const [view, setView] = useState<'login' | 'register'>('login');
  const [loginUser, setLoginUser] = useState('demo_operator');
  const [loginPass, setLoginPass] = useState('demo123');
  const [regUser, setRegUser] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const getUsers = (): Record<string, string> => {
    try {
      const stored = localStorage.getItem('hsUsers');
      if (!stored) {
        // Pre-populate default demo credentials
        const defaults: Record<string, string> = {
          demo_operator: 'demo123',
          admin: 'admin',
        };
        localStorage.setItem('hsUsers', JSON.stringify(defaults));
        return defaults;
      }
      return JSON.parse(stored);
    } catch {
      return {};
    }
  };

  const handleSignIn = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = loginUser.trim();
    const users = getUsers();
    if (!u || users[u] !== loginPass) {
      showMessage('Invalid credentials. Check username/password or register.');
      return;
    }
    onSignIn(u);
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
      showMessage('Username already exists.');
      return;
    }
    users[u] = p;
    localStorage.setItem('hsUsers', JSON.stringify(users));
    setLoginUser(u);
    setLoginPass(p);
    setView('login');
    showMessage('Demo account created. You may now sign in.');
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
          {view === 'login' ? (
            <div>
              <div className="eyebrow">OPERATOR AUTHENTICATION</div>
              <h2>Sign in</h2>
              <p className="muted">Enter your local simulation operator credentials.</p>
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
                <button type="submit" className="btn primary full">
                  Sign in to HARBORSTRIKE
                </button>
              </form>
              <p className="muted" style={{ textAlign: 'center', marginTop: '18px' }}>
                Need a new login?{' '}
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
              <p className="muted" style={{ textAlign: 'center', marginTop: '18px' }}>
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
            <strong>Local simulation environment only.</strong> Accounts and session tokens are stored in browser localStorage. Default demo account ready: <code>demo_operator</code> / <code>demo123</code>.
          </div>
        </div>
      </div>
    </section>
  );
}
