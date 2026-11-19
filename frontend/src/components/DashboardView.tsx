import type { PageId } from '../types';
import { APPS } from '../data/mockData';

interface DashboardViewProps {
  onNavigate: (page: PageId) => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const stats = [
    { label: 'Open support tickets', value: '12', sub: 'Customer and employee queues' },
    { label: 'Stored documents', value: '1,284', sub: 'Finance and operational folders' },
    { label: 'Active vendors', value: '48', sub: '3 require review' },
    { label: 'Connected integrations', value: '6', sub: '4 healthy · 2 attention' },
  ];

  const activities = [
    { app: 'LedgerOne', desc: 'Vendor V-0412 bank detail updated · approval reference not recorded' },
    { app: 'BlueVault', desc: 'Finance document access event · sample record' },
    { app: 'TallyBridge', desc: 'Vendor master sync completed' },
    { app: 'HelpDeskr', desc: 'Ticket HD-2048 assigned' },
  ];

  const systemStatus = [
    { name: 'HelpDeskr', status: 'Operational', badge: 'ok' },
    { name: 'BlueVault', status: 'Operational', badge: 'ok' },
    { name: 'LedgerOne', status: 'Operational', badge: 'ok' },
    { name: 'TallyBridge', status: 'Attention required', badge: 'warn' },
    { name: 'Identity / SSO', status: 'Operational', badge: 'ok' },
  ];

  return (
    <div>
      <div className="head">
        <div>
          <div className="eyebrow">OVERVIEW</div>
          <h1>Enterprise dashboard</h1>
          <p className="muted">Connected business systems in the Harbor & Finch simulation.</p>
        </div>
        <span className="pill">LOCAL SIMULATION</span>
      </div>

      <div className="grid stats">
        {stats.map((s, idx) => (
          <div key={idx} className="panel">
            <div className="muted">{s.label}</div>
            <div className="stat">{s.value}</div>
            <div className="small">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid modules">
        {Object.values(APPS).map((app) => (
          <div
            key={app.id}
            className="panel module"
            onClick={() => onNavigate(app.id)}
          >
            <div className="ico">{app.icon}</div>
            <div>
              <h3>{app.name}</h3>
              <p>{app.desc}</p>
              <div className="small" style={{ marginTop: '12px', color: 'var(--w-primary-ink)', fontWeight: 700 }}>
                Open application →
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid two" style={{ marginTop: '14px' }}>
        <div className="panel">
          <h3>Recent activity</h3>
          {activities.map((a, idx) => (
            <div key={idx} className="activity">
              <b>{a.app}</b>
              <div className="small">{a.desc}</div>
            </div>
          ))}
        </div>

        <div className="panel">
          <h3>System status</h3>
          {systemStatus.map((item, idx) => (
            <div key={idx} className="row">
              <b>{item.name}</b>
              <span className={`badge ${item.badge}`}>{item.status}</span>
            </div>
          ))}
          <div className="notice">
            No live enterprise services are connected. All events are sample data.
          </div>
        </div>
      </div>
    </div>
  );
}
