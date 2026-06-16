import { prisma } from "@/lib/prisma";
import { EmailManager } from "@/components/admin/email-manager";

export const dynamic = "force-dynamic";

export default async function AdminEmailPage() {
  const logs = await prisma.emailLog.findMany({ orderBy: { sentAt: "desc" }, take: 50 });
  const serialized = logs.map((log) => ({
    ...log,
    sentAt: log.sentAt.toISOString()
  }));
  return <EmailManager initialLogs={serialized} />;
}
