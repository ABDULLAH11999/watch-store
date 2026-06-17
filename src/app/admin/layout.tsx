import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    return <>{children}</>;
  }

  return <AdminShell userEmail={session.user.email}>{children}</AdminShell>;
}
