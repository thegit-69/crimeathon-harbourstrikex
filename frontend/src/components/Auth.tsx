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
      showMessage('Invalid account. Create a demo account first.');
      return;
    }
    onSignIn(u);
  };

  const handleRegister = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const u = regUser.trim();
    const p = regPass;
    if (!u || !p) {
      showMessage('Enter username and password.');
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
    showMessage('Account created. Sign in now.');
  };

  return (
    <section className="auth">
      <div className="brand">
        <div className="brand-mark" aria-label="HARBORSTRIKE logo">
          <ShieldLogo />
        </div>
        <div className="brand-title">HARBORSTRIKE</div>
        <div className="brand-apps">
          <div className="brand-app">
            <i>HD</i>HelpDeskr
          </div>
          <div className="brand-app">
            <i>BV</i>BlueVault
          </div>
          <div className="brand-app">
            <i>LO</i>LedgerOne
          </div>
          <div className="brand-app">
            <i>TB</i>TallyBridge
          </div>
        </div>
      </div>

      <div className="authbox">
        <div className="card">
          {view === 'login' ? (
            <div>
              <div className="eyebrow">WELCOME BACK</div>
              <h2>Sign in</h2>
              <p className="muted">Enter your simulation account details.</p>
              <form onSubmit={handleSignIn}>
                <div className="field">
                  <label>USERNAME</label>
                  <input
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Enter username"
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label>PASSWORD</label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <button type="submit" className="btn primary full">
                  Sign in to HARBORSTRIKE
                </button>
              </form>
              <p className="muted" style={{ textAlign: 'center', marginTop: '18px' }}>
                No account?{' '}
                <button
                  type="button"
                  className="link"
                  onClick={() => setView('register')}
                >
                  Create new account
                </button>
              </p>
            </div>
          ) : (
            <div>
              <div className="eyebrow">NEW SIMULATION USER</div>
              <h2>Create account</h2>
              <p className="muted">Create a local demo account.</p>
              <form onSubmit={handleRegister}>
                <div className="field">
                  <label>USERNAME</label>
                  <input
                    value={regUser}
                    onChange={(e) => setRegUser(e.target.value)}
                    placeholder="Choose username"
                    autoFocus
                  />
                </div>
                <div className="field">
                  <label>PASSWORD</label>
                  <input
                    type="password"
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="Create password"
                  />
                </div>
                <div className="field">
                  <label>CONFIRM PASSWORD</label>
                  <input
                    type="password"
                    value={regConfirm}
                    onChange={(e) => setRegConfirm(e.target.value)}
                    placeholder="Confirm password"
                  />
                </div>
                <button type="submit" className="btn primary full">
                  Create account
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
            Frontend demo only. Accounts are stored in this browser. Default demo account ready (<code>demo_operator</code> / <code>demo123</code>).
          </div>
        </div>
      </div>
    </section>
  );
}
