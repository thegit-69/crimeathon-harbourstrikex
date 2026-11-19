import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import './styles/harborstrike.css';
import type { AppTheme, RecordsData, TicketRecord, VendorRecord, KeyRecord, DocRecord, InvoiceRecord, SyncJobRecord } from './types';
import { INITIAL_RECORDS } from './data/mockData';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { HelpDeskrView } from './components/HelpDeskrView';
import { BlueVaultView } from './components/BlueVaultView';
import { LedgerOneView } from './components/LedgerOneView';
import { TallyBridgeView } from './components/TallyBridgeView';
import { EvidenceView } from './components/EvidenceView';
import { NotFoundView } from './components/NotFoundView';

function getThemeFromPath(pathname: string): AppTheme {
  const p = pathname.toLowerCase();
  if (p === '/helpdeskr') return 'help';
  if (p === '/bluevault') return 'blue';
  if (p === '/ledgerone') return 'ledger';
  if (p === '/tallybridge') return 'tally';
  if (p === '/evidence') return 'evidence';
  return 'overview';
}

function getCrumbFromPath(pathname: string): string {
  const p = pathname.toLowerCase();
  if (p === '/helpdeskr') return 'HelpDeskr';
  if (p === '/bluevault') return 'BlueVault';
  if (p === '/ledgerone') return 'LedgerOne';
  if (p === '/tallybridge') return 'TallyBridge';
  if (p === '/evidence') return 'Exploit & Attack Vectors';
  return 'Dashboard';
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem('hsCurrentUser');
    } catch {
      return null;
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<number | null>(null);

  const [records, setRecords] = useState<RecordsData>(() => {
    try {
      const saved = localStorage.getItem('hsRecords');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_RECORDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('hsRecords', JSON.stringify(records));
    } catch {
      // ignore
    }
  }, [records]);

  const showMessage = (msg: string) => {
    if (toastTimer) {
      window.clearTimeout(toastTimer);
    }
    setToastMessage(msg);
    const timer = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
    setToastTimer(timer);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSignIn = (username: string) => {
    try {
      localStorage.setItem('hsCurrentUser', username);
    } catch {
      // ignore
    }
    setUser(username);
    showMessage(`Signed in as ${username}`);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('hsCurrentUser');
    } catch {
      // ignore
    }
    setUser(null);
    showMessage('Signed out.');
    navigate('/');
  };

  // State update handlers for entities
  const handleAddTicket = (ticket: TicketRecord) => {
    setRecords((prev) => ({
      ...prev,
      tickets: [ticket, ...prev.tickets],
    }));
  };

  const handleUpdateTicketStatus = (index: number, newStatus: string) => {
    setRecords((prev) => {
      const updated = [...prev.tickets];
      if (updated[index]) {
        updated[index] = [...updated[index]];
        updated[index][4] = newStatus;
      }
      return { ...prev, tickets: updated };
    });
  };

  const handleAddVendor = (vendor: VendorRecord) => {
    setRecords((prev) => ({
      ...prev,
      vendors: [vendor, ...prev.vendors],
    }));
  };

  const handleAddKey = (key: KeyRecord) => {
    setRecords((prev) => ({
      ...prev,
      keys: [key, ...prev.keys],
    }));
  };

  const handleAddDoc = (doc: DocRecord) => {
    setRecords((prev) => ({
      ...prev,
      docs: [doc, ...prev.docs],
    }));
  };

  const handleAddInvoice = (inv: InvoiceRecord) => {
    setRecords((prev) => ({
      ...prev,
      invoices: [inv, ...prev.invoices],
    }));
  };

  const handleRunSync = (job: SyncJobRecord) => {
    setRecords((prev) => ({
      ...prev,
      jobs: [job, ...prev.jobs],
    }));
  };

  // Route: /
  if (location.pathname === '/') {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return (
      <>
        <Auth onSignIn={handleSignIn} showMessage={showMessage} />
        <Toast message={toastMessage} />
      </>
    );
  }

  // Protected route check: if unauthenticated, redirect to /
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Compatibility redirect for misspelling
  if (location.pathname.toLowerCase() === '/dashbord') {
    return <Navigate to="/dashboard" replace />;
  }

  // Normalize any uppercase/mixed-case URL to lowercase (e.g. /HelpDeskr -> /helpdeskr)
  if (location.pathname !== location.pathname.toLowerCase()) {
    return <Navigate to={location.pathname.toLowerCase() + location.search + location.hash} replace />;
  }

  const currentTheme = getThemeFromPath(location.pathname);
  const crumbText = getCrumbFromPath(location.pathname);

  return (
    <div
      id="app"
      className={sidebarOpen ? 'sidebar-open' : ''}
      data-theme={currentTheme}
    >
      {/* Sidebar preserved across navigation; explicit brand/logo toggle only */}
      <Sidebar
        username={user}
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      <main>
        <Header
          crumb={crumbText}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <div className="content" id="view">
          <Routes>
            {/* Canonical lowercase routes */}
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/evidence" element={<EvidenceView />} />

            <Route
              path="/helpdeskr"
              element={
                <HelpDeskrView
                  tickets={records.tickets}
                  onAddTicket={handleAddTicket}
                  onUpdateTicketStatus={handleUpdateTicketStatus}
                  showMessage={showMessage}
                />
              }
            />

            <Route
              path="/bluevault"
              element={
                <BlueVaultView
                  docs={records.docs}
                  keys={records.keys}
                  onAddDoc={handleAddDoc}
                  onAddKey={handleAddKey}
                  showMessage={showMessage}
                />
              }
            />

            <Route
              path="/ledgerone"
              element={
                <LedgerOneView
                  vendors={records.vendors}
                  invoices={records.invoices}
                  onAddVendor={handleAddVendor}
                  onAddInvoice={handleAddInvoice}
                  showMessage={showMessage}
                />
              }
            />

            <Route
              path="/tallybridge"
              element={
                <TallyBridgeView
                  keys={records.keys}
                  jobs={records.jobs}
                  onAddKey={handleAddKey}
                  onRunSync={handleRunSync}
                  showMessage={showMessage}
                />
              }
            />

            {/* Not Found Route */}
            <Route path="*" element={<NotFoundView user={user} />} />
          </Routes>
        </div>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
