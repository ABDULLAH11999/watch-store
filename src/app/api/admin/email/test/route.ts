import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const settings = await prisma.siteSettings.findMany({ where: { key: { in: ["emailSettings", "businessInfo"] } } });
  const emailSettings = settings.find((item) => item.key === "emailSettings");
  const businessInfo = settings.find((item) => item.key === "businessInfo");
  const email = emailSettings ? JSON.parse(emailSettings.value) : {};
  const business = businessInfo ? JSON.parse(businessInfo.value) : {};

  if (!email.fromEmail && !process.env.SMTP_FROM_EMAIL) {
    return NextResponse.json({ error: "SMTP not configured" }, { status: 400 });
  }

  await sendMail({
    to: email.fromEmail || process.env.SMTP_FROM_EMAIL || "",
    subject: "Anmol Gadgets Test Email",
    html: `
      <div style="font-family:Arial,sans-serif;padding:24px">
        <h1>Test Email</h1>
        <p>This is a test message from Anmol Gadgets.</p>
        <p>${business.contactPhone || ""}</p>
      </div>`,
    template: "test-email"
  });

  return NextResponse.json({ ok: true });
}
