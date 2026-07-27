import { Link, useRouterState } from "@tanstack/react-router";
import { BookOpen, Dumbbell, Flame, Gamepad2, Heart, Home, Settings, TrendingUp, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { CoachAvatar } from "./Coach";

const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/play", label: "Play", icon: Gamepad2 },
  { to: "/practice", label: "Practice", icon: Dumbbell },
  { to: "/library", label: "Sign Library", icon: BookOpen },
  { to: "/progress", label: "Progress", icon: TrendingUp },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen w-full">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar/85 px-4 py-6 backdrop-blur-xl lg:flex">
        <div className="pointer-events-none absolute inset-0 arcade-grid opacity-40" />
        <Link to="/" className="relative mb-7 flex items-center gap-3 px-2">
          <CoachAvatar size={44} />
          <div className="min-w-0">
            <p className="font-display text-lg leading-none tracking-wide text-primary text-glow">
              SIGN GAME
            </p>
            <p className="mt-1 truncate text-[10px] font-extrabold tracking-[0.18em] text-muted-foreground uppercase">
              SgSL Arcade
            </p>
          </div>
        </Link>

        <div className="hud-panel relative mb-5 p-3">
          <div className="flex items-center justify-between text-[10px] font-extrabold tracking-widest text-muted-foreground uppercase">
            <span>Player</span>
            <span className="text-primary">LV 7</span>
          </div>
          <p className="mt-1 font-display text-sm tracking-wide">AMIRA</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 rounded-full bg-gradient-sky glow-ring" />
          </div>
          <p className="mt-1.5 text-[10px] font-bold text-muted-foreground">1,340 / 2,000 XP</p>
        </div>

        <nav className="relative flex flex-col gap-1.5">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-xs font-extrabold tracking-widest uppercase transition-all",
                  active
                    ? "bg-primary text-primary-foreground shadow-[var(--shadow-pop)]"
                    : "border border-transparent text-sidebar-foreground hover:border-primary/40 hover:bg-sidebar-accent hover:text-primary",
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition-all",
                    active ? "bg-accent" : "bg-transparent",
                  )}
                />
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative mt-auto hud-panel p-4">
          <p className="font-display text-xs tracking-widest text-accent text-glow-accent">
            DAILY QUEST
          </p>
          <p className="mt-1 text-xs font-bold text-muted-foreground">3 / 5 signs cleared</p>
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-3/5 rounded-full bg-gradient-sunset" />
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <div className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="flex items-center gap-2 lg:hidden">
              <CoachAvatar size={28} />
              <span className="font-display text-sm tracking-wide text-primary text-glow">
                SIGN GAME
              </span>
            </div>
            <ul className="ml-auto flex items-center gap-2 text-[11px] font-extrabold tracking-widest uppercase">
              <li className="hud-panel flex items-center gap-1.5 px-2.5 py-1.5 text-accent">
                <Flame className="h-3.5 w-3.5" /> 7
              </li>
              <li className="hud-panel flex items-center gap-1.5 px-2.5 py-1.5 text-mint">
                <Zap className="h-3.5 w-3.5" /> 1,340
              </li>
              <li className="hud-panel flex items-center gap-1.5 px-2.5 py-1.5 text-bubble">
                <Heart className="h-3.5 w-3.5" /> 3
              </li>
            </ul>
          </div>
        </div>
        <main className="mx-auto w-full max-w-6xl px-4 pt-5 pb-28 sm:px-6 lg:pb-10">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-primary/30 bg-card/90 backdrop-blur-xl lg:hidden">
        <ul className="grid grid-cols-6">
          {NAV.map((item) => {
            const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex flex-col items-center gap-1 px-1 py-2.5 text-[9px] font-extrabold tracking-widest uppercase transition-colors",
                    active ? "text-primary text-glow" : "text-muted-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", active && "scale-110")} />
                  <span className="truncate">{item.label.split(" ")[0]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
