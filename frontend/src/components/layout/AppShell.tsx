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
              "nav-pill",
              mobile && "justify-center px-2",
              isActive
                ? "nav-pill-active"
                : "text-muted-foreground hover:bg-white/70 hover:text-foreground hover:shadow-soft",
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
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
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="avatar-ring rounded-full">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-card text-xs font-bold text-royal">
            {user.name.charAt(0).toUpperCase()}
          </span>
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
          className="h-8 w-8 shrink-0 rounded-xl p-0"
          aria-label="Log out"
          title="Log out"
        >
          <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex w-full gap-2", compact && "justify-center")}>
      <Button asChild variant="secondary" size="sm" className="flex-1">
        <Link to="/login">Log in</Link>
      </Button>
      <Button asChild size="sm" className="flex-1">
        <Link to="/signup">Sign up</Link>
      </Button>
    </div>
  );
}

export function AppShell() {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="sticky top-0 hidden h-screen px-4 py-5 lg:block">
        <div className="flex h-full flex-col rounded-[26px] border border-white/80 bg-card/75 px-4 py-6 shadow-float backdrop-blur-2xl">
          <div className="px-2">
            <Logo />
            <p className="mt-2 pl-11 text-xs text-muted-foreground">
              Attrition risk intelligence
            </p>
          </div>

          <nav className="mt-9 flex flex-col gap-1.5" aria-label="Main navigation">
            <NavItems />
          </nav>

          <div className="mt-auto space-y-3 px-1">
            <div className="glass-panel p-4">
              <div className="mb-2 flex items-center gap-2.5 text-xs font-bold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-royal-soft text-royal">
                  <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                Decision support
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Predictions inform conversations — they never replace them.
              </p>
            </div>
            <div className="profile-card">
              <AuthControls />
            </div>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/70 bg-background/85 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Logo />
        </header>
        <nav
          className="sticky top-[57px] z-20 flex gap-1 border-b border-white/70 bg-background/85 px-3 py-2 backdrop-blur-xl lg:hidden"
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
