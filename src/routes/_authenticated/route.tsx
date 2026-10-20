import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard, FolderKanban, Library, Sparkles, Target, Atom, Crosshair, ShieldAlert,
  LineChart, FileText, Settings, FlaskConical, LogOut, Menu,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) throw redirect({ to: "/auth" });
    return { user: data.user };
  },
  component: Shell,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/compounds", label: "Compound Library", icon: Library },
  { to: "/generative", label: "Generative Design", icon: Sparkles, later: true },
  { to: "/lead-optimization", label: "Lead Optimization", icon: Target },
  { to: "/properties", label: "Molecular Properties", icon: Atom },
  { to: "/docking", label: "Docking & Binding", icon: Crosshair, later: true },
  { to: "/admet", label: "ADMET Assessment", icon: ShieldAlert, later: true },
  { to: "/analysis", label: "Analysis & Validation", icon: LineChart, later: true },
  { to: "/reports", label: "Reports", icon: FileText, later: true },
  { to: "/settings", label: "Settings & Integrations", icon: Settings },
] as const;

function Shell() {
  const { user } = Route.useRouteContext();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="grid size-7 place-items-center rounded bg-brand"><FlaskConical className="size-4 text-primary-foreground" /></div>
          <span className="font-semibold">MolForge <span className="text-brand">AI</span></span>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {nav.map((n) => {
            const active = path === n.to || path.startsWith(n.to + "/");
            return (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)}
                className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  active && "bg-sidebar-accent text-sidebar-accent-foreground font-medium")}>
                <n.icon className={cn("size-4", active ? "text-cyan" : "text-muted-foreground")} />
                <span className="flex-1 truncate">{n.label}</span>
                {"later" in n && <span className="rounded border border-sidebar-border px-1 text-[10px] text-muted-foreground">setup</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start" onClick={signOut}><LogOut /> Sign out</Button>
        </div>
      </aside>
      {open && <div className="fixed inset-0 z-30 bg-background/70 lg:hidden" onClick={() => setOpen(false)} />}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <div className="flex h-14 items-center border-b px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></Button>
          <span className="ml-2 font-semibold">MolForge AI</span>
        </div>
        <main className="flex-1 px-6 py-6 xl:px-8"><Outlet /></main>
      </div>
    </div>
  );
}
