"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  LayoutGrid,
  CalendarClock,
  FolderKanban,
  Users,
  CheckCircle2,
  BarChart3,
  LogOut,
  Calendar,
  LineChart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Profile } from "@/lib/types";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutGrid },
  { name: "Timesheet", href: "/dashboard/timesheet", icon: CalendarClock },
  { name: "Calendrier", href: "/dashboard/calendar", icon: Calendar },
  { name: "Projets", href: "/dashboard/projects", icon: FolderKanban },
  { name: "Équipe", href: "/dashboard/team", icon: Users },
];

const management = [
  {
    name: "Validations",
    href: "/dashboard/approvals",
    icon: CheckCircle2,
    badge: 3,
  },
  { name: "Analytics", href: "/dashboard/analytics", icon: LineChart },
  { name: "Rapports", href: "/dashboard/reports", icon: BarChart3 },
];

interface SidebarProps {
  user: Profile | null;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }
    router.push("/login");
    router.refresh();
  };

  const NavItem = ({
    href,
    icon: Icon,
    children,
    badge,
  }: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    badge?: number;
  }) => {
    const isActive = pathname === href;

    return (
      <Link
        href={href}
        className={`group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? "text-primary-400 bg-primary-500/10"
            : "text-slate-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <div className="flex items-center">
          <Icon className="w-5 h-5 mr-3" />
          {children}
        </div>
        {badge && (
          <span className="bg-primary-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="w-64 glass-panel border-r border-white/5 flex flex-col z-20">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-primary-500/20">
          <Activity className="text-white w-5 h-5" />
        </div>
        <span className="text-lg font-medium tracking-tight text-white">
          TimeFlow <span className="text-primary-400 font-light">Pro</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        <div className="px-3 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          Menu
        </div>

        {navigation.map((item) => (
          <NavItem key={item.href} href={item.href} icon={item.icon}>
            {item.name}
          </NavItem>
        ))}

        <div className="mt-8 px-3 mb-2 text-xs font-medium text-slate-500 uppercase tracking-wider">
          Management
        </div>

        {management.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            badge={item.badge}
          >
            {item.name}
          </NavItem>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-white/5">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
          <img
            src={
              user?.avatar_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "default"}&backgroundColor=b6e3f4`
            }
            alt="User"
            className="w-9 h-9 rounded-full ring-2 ring-primary-500/30"
          />
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-medium text-white truncate">
              {user?.name || "Utilisateur"}
            </p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Déconnexion"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
