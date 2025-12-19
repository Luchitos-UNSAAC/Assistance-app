import {AdminSidebar} from "@/features/admin/components/layout-admin";
import {getCurrentAdminUser} from "@/lib/get-current-admin-user";
import {redirect} from "next/navigation";

export default async function AdminLayout({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
  const userAdmin = await getCurrentAdminUser();
  if (!userAdmin) {
    redirect('/')
  }
  return (
    <div className="flex max-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main content */}
      <main className="flex-1 bg-gray-50 p-6 overflow-auto pb-20 pt-12">
        {children}
      </main>
    </div>
  );
}
