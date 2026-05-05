'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Settings,
  BarChart3, UserX2Icon
} from "lucide-react";
import { cn } from "@/lib/utils"; // Usamos cn que es el estándar de Shadcn
import { ModeToggle } from "@/components/toggle-theme-button";

const NAV_ITEMS = [
  { label: "Voluntarios", href: "/admin/volunteers", icon: Users },
  { label: "Convocatorias", href: "/admin/calls", icon: UserX2Icon },
  { label: "Configuraciones", href: "/admin/settings", icon: Settings },
  { label: "Reportes", href: "/admin/reports", icon: BarChart3 },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-52 bg-card flex flex-col border-r border-border/50 backdrop-blur-md">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <span className="text-sm font-bold tracking-tight uppercase text-primary">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col gap-2 p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
            © {new Date().getFullYear()} LUCHOS
          </span>
          <ModeToggle />
        </div>
      </div>
    </aside>
  );
}
