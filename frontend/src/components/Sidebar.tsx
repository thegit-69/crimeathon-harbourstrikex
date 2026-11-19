import type { PageId } from '../types';

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  username: string;
  onLogout: () => void;
}

export function Sidebar({ currentPage, onNavigate, username, onLogout }: SidebarProps) {
  return (
    <aside className="side" id="side">
      <div className="logo">
        <span className="hs-name">HARBORSTRIKE</span>
      </div>

      <div className="label">WORKSPACE</div>
      <nav className="nav">
        <button
          type="button"
          data-page="dashboard"
          className={currentPage === 'dashboard' ? 'active' : ''}
          onClick={() => onNavigate('dashboard')}
        >
          ▦ &nbsp; Dashboard
        </button>
      </nav>

      <div className="label">BUSINESS SYSTEMS</div>
      <nav className="nav">
        <button
          type="button"
          data-page="help"
          className={currentPage === 'help' ? 'active' : ''}
          onClick={() => onNavigate('help')}
        >
          ▤ &nbsp; HelpDeskr
        </button>
        <button
          type="button"
          data-page="blue"
          className={currentPage === 'blue' ? 'active' : ''}
          onClick={() => onNavigate('blue')}
        >
          ▣ &nbsp; BlueVault
        </button>
        <button
          type="button"
          data-page="ledger"
          className={currentPage === 'ledger' ? 'active' : ''}
          onClick={() => onNavigate('ledger')}
        >
          ▥ &nbsp; LedgerOne
        </button>
        <button
          type="button"
          data-page="tally"
          className={currentPage === 'tally' ? 'active' : ''}
          onClick={() => onNavigate('tally')}
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
