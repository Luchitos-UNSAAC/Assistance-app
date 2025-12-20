'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Settings, BarChart3 } from "lucide-react";
import clsx from "clsx";

const NAV_ITEMS = [
  {
    label: "Voluntarios",
    href: "/admin/volunteers",
    icon: Users,
  },
  {
    label: "Config",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    label: "Reportes",
    href: "/admin/reports",
    icon: BarChart3,
  },
];

export function AdminMobileTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        border-t bg-white
        md:hidden
      "
    >
      <ul className="flex justify-around">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const isActive = pathname.startsWith(href);

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={clsx(
                  "flex flex-col items-center justify-center gap-1 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "text-fuchsia-700"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <Icon
                  className={clsx(
                    "h-5 w-5",
                    isActive ? "text-fuchsia-700" : "text-gray-500"
                  )}
                />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
