'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Settings,
  BarChart3
} from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  {
    label: "Voluntarios",
    href: "/admin/volunteers",
    icon: Users,
  },
  {
    label: "Configuraciones",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Reportes",
    href: "/admin/reports",
    icon: BarChart3,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-screen w-52 bg-white flex flex-col">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b">
        <span className="text-lg font-semibold tracking-tight">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-fuchsia-700 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-4 text-xs text-gray-500">
        © {new Date().getFullYear()} Admin
      </div>
    </aside>
  );
}
