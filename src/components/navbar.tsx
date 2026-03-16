import Link from "next/link";

function Navbar() {
  return (
    <nav className="flex items-center justify-between h-14 px-10 border-b border-border-primary bg-bg-page">
      <Link href="/" className="flex items-center gap-2">
        <span className="font-mono text-xl font-bold text-accent-green">
          {">"}
        </span>
        <span className="font-mono text-lg font-medium text-text-primary">
          devroast
        </span>
      </Link>

      <div className="flex items-center gap-6">
        <Link
          href="/leaderboard"
          className="font-mono text-[13px] text-text-secondary hover:text-text-primary transition-colors"
        >
          leaderboard
        </Link>
        <Link
          href="/privacidade"
          className="font-mono text-[13px] text-text-tertiary hover:text-text-primary transition-colors"
        >
          privacidade
        </Link>
      </div>
    </nav>
  );
}

export { Navbar };
