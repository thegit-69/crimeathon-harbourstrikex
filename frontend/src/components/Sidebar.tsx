import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  username: string;
  onLogout: () => void;
  onToggleSidebar: () => void;
}

export function Sidebar({ username, onLogout, onToggleSidebar }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname.toLowerCase();
  const isDashboard = currentPath === '/dashboard' || currentPath === '/dashbord';
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

      <div className="bottom">
        <p className="small">LOGGED IN AS</p>
        <b id="uname">{username || 'Demo user'}</b>
        <button type="button" className="btn ghost full" onClick={onLogout}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
