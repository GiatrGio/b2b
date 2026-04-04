import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";
import { SupplierSidebar } from "@/components/layout/supplier-sidebar";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="flex">
          <SupplierSidebar />
          <main className="flex-1 p-4 lg:p-6">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
