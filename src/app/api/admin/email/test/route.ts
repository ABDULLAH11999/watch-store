import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { buildTestEmail, resolveMailConfig, sendMail } from "@/lib/email";

export const dynamic = "force-dynamic";

export async function POST() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const settings = await prisma.siteSettings.findMany({ where: { key: { in: ["emailSettings", "businessInfo"] } } });
  const businessInfo = settings.find((item) => item.key === "businessInfo");
  const business = businessInfo ? JSON.parse(businessInfo.value) : {};
  const { adminEmail } = await resolveMailConfig();

  if (!adminEmail) {
    return NextResponse.json({ error: "Admin email is not configured" }, { status: 400 });
  }

  const template = buildTestEmail({
    title: "Anmol Gadgets Checkout Test Email",
    message: "This is a test message from the Anmol Gadgets order email system.",
    business: {
      phone: business.contactPhone || "",
      email: business.contactEmail || "",
      address: business.shopAddress || ""
    }
  });

  await sendMail({
    to: adminEmail,
    subject: template.subject,
    html: template.html,
    template: "test-email"
  });

  return NextResponse.json({ ok: true });
}
