import { useState, useEffect } from 'react';
import './styles/harborstrike.css';
import type { PageId, AppTheme, RecordsData, TicketRecord, VendorRecord, KeyRecord, DocRecord, InvoiceRecord, SyncJobRecord } from './types';
import { APPS, INITIAL_RECORDS } from './data/mockData';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Toast } from './components/Toast';
import { DashboardView } from './components/DashboardView';
import { HelpDeskrView } from './components/HelpDeskrView';
import { BlueVaultView } from './components/BlueVaultView';
import { LedgerOneView } from './components/LedgerOneView';
import { TallyBridgeView } from './components/TallyBridgeView';

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastTimer, setToastTimer] = useState<number | null>(null);

  const [records, setRecords] = useState<RecordsData>(INITIAL_RECORDS);

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
    setUser(username);
    setCurrentPage('dashboard');
    setSidebarOpen(true);
    showMessage(`Signed in as ${username}`);
  };

  const handleLogout = () => {
    setUser(null);
    setSidebarOpen(false);
    showMessage('Signed out.');
  };

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
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

  // If not logged in, show Auth
  if (!user) {
    return (
      <>
        <Auth onSignIn={handleSignIn} showMessage={showMessage} />
        <Toast message={toastMessage} />
      </>
    );
  }

  const currentTheme: AppTheme = currentPage === 'dashboard' ? 'overview' : currentPage;
  const crumbText = currentPage === 'dashboard' ? 'Dashboard' : APPS[currentPage].name;

  return (
    <div
      id="app"
      className={sidebarOpen ? 'sidebar-open' : ''}
      data-theme={currentTheme}
    >
      <div id="sideBackdrop" onClick={() => setSidebarOpen(false)} />

      <Sidebar
        currentPage={currentPage}
        onNavigate={handleNavigate}
        username={user}
        onLogout={handleLogout}
      />

      <main>
        <Header
          crumb={crumbText}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        <div className="content" id="view">
          {currentPage === 'dashboard' && (
            <DashboardView onNavigate={handleNavigate} />
          )}
          {currentPage === 'help' && (
            <HelpDeskrView
              tickets={records.tickets}
              onAddTicket={handleAddTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              showMessage={showMessage}
            />
          )}
          {currentPage === 'blue' && (
            <BlueVaultView
              docs={records.docs}
              keys={records.keys}
              onAddDoc={handleAddDoc}
              onAddKey={handleAddKey}
              showMessage={showMessage}
            />
          )}
          {currentPage === 'ledger' && (
            <LedgerOneView
              vendors={records.vendors}
              invoices={records.invoices}
              onAddVendor={handleAddVendor}
              onAddInvoice={handleAddInvoice}
              showMessage={showMessage}
            />
          )}
          {currentPage === 'tally' && (
            <TallyBridgeView
              keys={records.keys}
              jobs={records.jobs}
              onAddKey={handleAddKey}
              onRunSync={handleRunSync}
              showMessage={showMessage}
            />
          )}
        </div>
      </main>

      <Toast message={toastMessage} />
    </div>
  );
}
