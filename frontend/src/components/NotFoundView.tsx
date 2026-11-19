import { useNavigate } from 'react-router-dom';

interface NotFoundViewProps {
  user: string | null;
}

export function NotFoundView({ user }: NotFoundViewProps) {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '540px', margin: '48px auto', textAlign: 'center' }}>
      <div className="panel" style={{ padding: '36px 28px' }}>
        <div className="eyebrow">404 NOT FOUND</div>
        <h1 style={{ margin: '10px 0 6px', fontSize: '24px' }}>Page not found</h1>
        <p className="muted" style={{ marginBottom: '22px', fontSize: '13px' }}>
          The requested route does not exist in the simulation workspace.
        </p>
        <button
          type="button"
          className="btn primary"
          onClick={() => navigate(user ? '/dashboard' : '/')}
        >
          {user ? 'Return to Dashboard' : 'Return to Sign In'}
        </button>
      </div>
    </div>
  );
}
