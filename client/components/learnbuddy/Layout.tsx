import { Link, NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-500" />
      <span className="font-extrabold text-lg tracking-tight">YouTube Learn Buddy</span>
    </Link>
  );
}

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn(
    "px-3 py-2 rounded-md text-sm font-medium",
    isActive
      ? "bg-violet-600 text-white"
      : "text-foreground/80 hover:text-foreground hover:bg-violet-500/10",
  );

export default function Layout({ children }: { children?: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[radial-gradient(1000px_400px_at_10%_-10%,hsl(var(--accent)/0.4),transparent),radial-gradient(800px_300px_at_80%_0%,hsl(var(--primary)/0.15),transparent)]">
      <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={navLink} end>
              Home
            </NavLink>
            <NavLink to="/leaderboard" className={navLink}>
              Leaderboard
            </NavLink>
            <NavLink to="/settings" className={navLink}>
              Settings
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="secondary">
              <a href="#demo">Try the Demo</a>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t">
        <div className="container py-8 text-sm text-foreground/70 flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            Built for better learning. Privacy-first. No accounts required by default.
          </p>
          <div className="flex items-center gap-4">
            <a className="hover:text-foreground" href="#features">Features</a>
            <a className="hover:text-foreground" href="#privacy">Privacy</a>
            <a className="hover:text-foreground" href="#demo">Demo</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
