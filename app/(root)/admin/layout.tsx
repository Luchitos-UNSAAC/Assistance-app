import {AdminSidebar} from "@/features/admin/components/layout-admin";

export default function AdminLayout({
                                      children,
                                    }: {
  children: React.ReactNode;
}) {
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
