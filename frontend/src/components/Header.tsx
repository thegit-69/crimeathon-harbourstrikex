import { ShieldLogo } from './ShieldLogo';

interface HeaderProps {
  crumb: string;
  onToggleSidebar: () => void;
}

export function Header({ crumb, onToggleSidebar }: HeaderProps) {
  return (
    <header className="top">
      <div className="top-brand">
        <button
          type="button"
          className="brand-trigger"
          aria-label="Toggle sidebar"
          title="Toggle navigation"
          onClick={onToggleSidebar}
        >
          <ShieldLogo />
        </button>
        <span className="slash">/</span>
        <b id="crumb">{crumb}</b>
      </div>
      <span className="pill">● Simulation environment</span>
    </header>
  );
}
