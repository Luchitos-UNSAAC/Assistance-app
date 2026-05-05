import {AdminSidebar} from "@/features/admin/components/layout-admin";
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";
import {redirect} from "next/navigation";
import {AdminMobileTabs} from "@/features/admin/components/tabs-mobile-admin";
import type React from "react";
import {Toaster} from "@/components/ui/toaster";
import {AdminNavbar} from "@/components/admin-navbar";

export default async function AdminLayout({children}: { children: React.ReactNode }) {
  const userAdmin = await getCurrentAdminUser();
  if (!userAdmin) redirect("/");

  return (
    <div className="h-screen w-full overflow-hidden flex"> {/* Añadido flex para mejor control */}

      {/* Sidebar (desktop) - SUBIMOS Z-INDEX A 60 */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:z-60 md:block md:w-52 border-r border-border/50">
        <AdminSidebar/>
      </aside>

      <div className="flex flex-col flex-1 md:ml-52">
        {/* Navbar - BAJAMOS Z-INDEX O AJUSTAMOS EL ANCHO */}
        <AdminNavbar/>

        {/* Main content */}
        <main className="h-full overflow-y-auto pt-16 pb-24 px-4 sm:px-6 md:px-8">
          {children}
        </main>
      </div>

      {/* Mobile tabs - MANTENER EN Z-50 */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50">
        <AdminMobileTabs/>
      </div>

      <Toaster/>
    </div>
  );
}
