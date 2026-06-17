import { auth } from "@/lib/auth";
import { AdminShell } from "@/components/admin-shell";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login?callbackUrl=/admin");
  }

  return <AdminShell userEmail={session.user.email}>{children}</AdminShell>;
}
