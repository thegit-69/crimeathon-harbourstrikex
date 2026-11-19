import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  username: string;
  onLogout: () => void;
  onToggleSidebar: () => void;
  backendConnected?: boolean | null;
  onCheckHealth?: () => void;
}

export function Sidebar({
  username,
  onLogout,
  onToggleSidebar,
  backendConnected,
  onCheckHealth,
}: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.toLowerCase();
  const isDashboard = currentPath === '/dashboard' || currentPath === '/dashbord';
  const isEvidence = currentPath === '/evidence';
  const isHelp = currentPath === '/helpdeskr';
  const isBlue = currentPath === '/bluevault';
  const isLedger = currentPath === '/ledgerone';
  const isTally = currentPath === '/tallybridge';

  return (
    <aside className="side" id="side">
      <div
        className="logo"
        onClick={onToggleSidebar}
        style={{ cursor: 'pointer' }}
        title="Toggle sidebar"
      >
        <span className="hs-name">HARBORSTRIKE</span>
      </div>

      <div className="label">WORKSPACE</div>
      <nav className="nav">
        <button
          type="button"
          data-page="dashboard"
          className={isDashboard ? 'active' : ''}
          onClick={() => navigate('/dashboard')}
        >
          ▦ &nbsp; Dashboard
        </button>
      </nav>

      <div className="label">BUSINESS SYSTEMS</div>
      <nav className="nav">
        <button
          type="button"
          data-page="help"
          className={isHelp ? 'active' : ''}
          onClick={() => navigate('/helpdeskr')}
        >
          ▤ &nbsp; HelpDeskr
        </button>
        <button
          type="button"
          data-page="blue"
          className={isBlue ? 'active' : ''}
          onClick={() => navigate('/bluevault')}
        >
          ▣ &nbsp; BlueVault
        </button>
        <button
          type="button"
          data-page="ledger"
          className={isLedger ? 'active' : ''}
          onClick={() => navigate('/ledgerone')}
        >
          ▥ &nbsp; LedgerOne
        </button>
        <button
          type="button"
          data-page="tally"
          className={isTally ? 'active' : ''}
          onClick={() => navigate('/tallybridge')}
        >
          ⌘ &nbsp; TallyBridge
        </button>
      </nav>

      <div className="label">INVESTIGATION</div>
      <nav className="nav">
        <button
          type="button"
          data-page="evidence"
          className={isEvidence ? 'active' : ''}
          onClick={() => navigate('/evidence')}
        >
          ⚡ &nbsp; Exploit & Attack Vectors
        </button>
      </nav>

      <div className="bottom">
        {/* Backend Connection Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '7px 10px',
            marginBottom: '12px',
            borderRadius: '7px',
            fontSize: '11px',
            fontWeight: 700,
            background:
              backendConnected === true
                ? 'rgba(34, 197, 94, 0.12)'
                : backendConnected === false
                ? 'rgba(239, 68, 68, 0.12)'
                : 'rgba(148, 163, 184, 0.12)',
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
          title={
            backendConnected === true
              ? 'FastAPI Backend connected (http://localhost:8000)'
              : backendConnected === false
              ? 'Backend disconnected. Running in offline/fallback mode.'
              : 'Probing backend status...'
          }
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
                ? 'API Connected'
                : backendConnected === false
                ? 'Backend Disconnected'
                : 'Checking API...'}
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
              title="Refresh connection status"
            >
              ↻
            </button>
          )}
        </div>

        <p className="small">LOGGED IN AS</p>
        <b id="uname">{username || 'demo_operator'}</b>
        <button type="button" className="btn ghost full" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
