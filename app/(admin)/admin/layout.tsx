import { AdminSidebar } from "@/features/admin/components/layout-admin";
import { getCurrentAdminUser } from "@/lib/get-current-admin-user";
import { redirect } from "next/navigation";
import { AdminMobileTabs } from "@/features/admin/components/tabs-mobile-admin";
import { Navbar } from "@/components/navbar";
import type React from "react";

export default async function AdminLayout({
                                            children,
                                          }: {
  children: React.ReactNode;
}) {
  const userAdmin = await getCurrentAdminUser();

  if (!userAdmin) {
    redirect("/");
  }

  return (
    <div className="h-screen w-full overflow-hidden">
      {/* Navbar */}
      <Navbar />

      {/* Sidebar (desktop) */}
      <aside className="hidden md:fixed md:inset-y-0 md:z-30 md:block md:w-52">
        <AdminSidebar />
      </aside>

      {/* Main content */}
      <main
        className="
          h-full overflow-y-auto
          pt-16 pb-24
          px-4 sm:px-6
          md:ml-52 md:px-8
        "
      >
        {children}
      </main>

      {/* Mobile tabs */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
        <AdminMobileTabs />
      </div>
    </div>
  );
}
