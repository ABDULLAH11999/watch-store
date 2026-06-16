import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;
  const body = await request.json();
  const log = await prisma.emailLog.findUnique({ where: { id: body.id } });
  if (!log) return NextResponse.json({ error: "Email log not found" }, { status: 404 });

  await sendMail({
    to: log.toEmail,
    subject: `${log.subject} (Resent)`,
    html: `<div style="font-family:Arial,sans-serif;padding:24px"><h1>Anmol Gadgets</h1><p>This message was resent from the admin panel.</p><p>Template: ${log.template}</p></div>`,
    template: `resent-${log.template}`
  });
  return NextResponse.json({ ok: true });
}
