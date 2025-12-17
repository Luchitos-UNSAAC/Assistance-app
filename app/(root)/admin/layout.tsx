import {HeaderAdmin} from "@/features/admin/components/header-admin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="p-6">
      <div className="pt-20 pb-20">
        <HeaderAdmin />
        {children}
      </div>
    </div>
  );
}
