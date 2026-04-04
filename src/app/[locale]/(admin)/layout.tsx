import { SessionProvider } from "@/components/providers/session-provider";
import { Navbar } from "@/components/layout/navbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-surface">
        <Navbar />
        <main className="max-w-5xl mx-auto p-4 lg:p-6">{children}</main>
      </div>
    </SessionProvider>
  );
}
