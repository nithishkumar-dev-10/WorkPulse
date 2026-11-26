import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  FileSpreadsheet,
  History,
  Info,
  Loader2,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";
import { StatusPill } from "./StatusPill";

const links = [
  { to: "/", label: "Predict", icon: Sparkles, end: true },
  { to: "/batch", label: "Batch", icon: FileSpreadsheet, end: false },
  { to: "/history", label: "History", icon: History, end: false },
  { to: "/about", label: "About", icon: Info, end: false },
];

function NavItems({ mobile = false }: { mobile?: boolean }) {
  return (
    <>
      {links.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
              mobile && "justify-center px-2",
              isActive
                ? "bg-accent-soft text-accent"
                : "text-muted-foreground hover:bg-card-muted hover:text-foreground",
            )
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span className={cn(mobile && "sr-only")}>{label}</span>
        </NavLink>
      ))}
    </>
  );
}

function AuthControls({ compact = false }: { compact?: boolean }) {
  const { user, status, logout } = useAuth();

  if (status === "loading") {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
        Checking session…
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-bold text-accent">
          {user.name.charAt(0).toUpperCase()}
        </span>
        {!compact && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold">{user.name}</p>
            <p className="truncate text-[10px] text-muted-foreground">{user.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void logout()}
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
          {!compact && "Log out"}
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex gap-2", compact && "w-full justify-center")}>
      <Button asChild variant="secondary" size="sm">
        <Link to="/login">Log in</Link>
      </Button>
      <Button asChild size="sm">
        <Link to="/signup">Sign up</Link>
      </Button>
    </div>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-border/70 bg-card/70 px-5 py-6 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Logo />
          <p className="mt-2 pl-11 text-xs text-muted-foreground">
            Attrition risk intelligence
          </p>
        </div>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Main navigation">
          <NavItems />
        </nav>
        <div className="mt-auto space-y-4 px-1">
          <div className="rounded-2xl border border-border bg-card-muted/70 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold text-foreground">
              <BarChart3 className="h-4 w-4 text-accent" aria-hidden="true" />
              Decision support
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Predictions inform conversations — they never replace them.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-3">
            <AuthControls />
          </div>
          <StatusPill />
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/70 bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Logo compact />
          <StatusPill />
        </header>
        <nav
          className="sticky top-[57px] z-20 flex gap-1 border-b border-border/70 bg-background/85 px-3 py-2 backdrop-blur-xl lg:hidden"
          aria-label="Mobile navigation"
        >
          <div className="w-full">
            <div className="grid w-full grid-cols-4 gap-1">
              <NavItems mobile />
            </div>
            <div className="mt-2 border-t border-border/60 pt-2">
              <AuthControls compact />
            </div>
          </div>
        </nav>

        <main className="mx-auto w-full max-w-[1180px] px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
