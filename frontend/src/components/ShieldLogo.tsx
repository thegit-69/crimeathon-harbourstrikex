interface ShieldLogoProps {
  className?: string;
  style?: React.CSSProperties;
}

export function ShieldLogo({ className, style }: ShieldLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M32 4L54 13V29C54 43 45 54 32 60C19 54 10 43 10 29V13L32 4Z"
        stroke="currentColor"
        strokeWidth="3.2"
      />
      <path
        d="M17 36H27L34 20L30 33H43L25 49L30 36H17Z"
        fill="currentColor"
      />
      <path
        d="M18 15L32 9L46 15"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}
