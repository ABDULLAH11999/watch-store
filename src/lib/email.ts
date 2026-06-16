import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

function getTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      : undefined
  });
}

export async function sendMail(params: {
  to: string;
  subject: string;
  html: string;
  template: string;
}) {
  try {
    const transporter = getTransport();
    const fromName = process.env.SMTP_FROM_NAME || "Anmol Gadgets";
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || "no-reply@anmolgadgets.com";
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: params.to,
      subject: params.subject,
      html: params.html
    });

    await prisma.emailLog.create({
      data: {
        toEmail: params.to,
        subject: params.subject,
        template: params.template,
        status: "SENT",
        sentAt: new Date()
      }
    });

    return { ok: true, messageId: info.messageId };
  } catch (error) {
    await prisma.emailLog.create({
      data: {
        toEmail: params.to,
        subject: params.subject,
        template: params.template,
        status: "FAILED",
        sentAt: new Date()
      }
    });
    return { ok: false, error };
  }
}

export function orderConfirmationEmail(input: {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  total: number;
  business: { phone: string; email: string; address: string };
}) {
  const rows = input.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px;border-bottom:1px solid #333;">${item.name}</td>
        <td style="padding:10px;border-bottom:1px solid #333;">${item.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #333;">PKR ${item.price.toLocaleString("en-PK")}</td>
      </tr>`
    )
    .join("");

  return {
    subject: `Order Confirmation ${input.orderNumber} | Anmol Gadgets`,
    html: `
      <div style="background:#111;color:#fff;padding:32px;font-family:Arial,sans-serif">
        <div style="max-width:680px;margin:0 auto;background:#1a1a1a;border:1px solid #d4a843;border-radius:16px;overflow:hidden">
          <div style="background:#0f0f0f;padding:24px 28px;border-bottom:1px solid #d4a843">
            <h1 style="margin:0;font-size:28px;color:#d4a843">Anmol Gadgets</h1>
            <p style="margin:8px 0 0;color:#ddd">Luxury timepieces, delivered with care</p>
          </div>
          <div style="padding:28px">
            <h2 style="margin:0 0 12px">Thank you, ${input.customerName}</h2>
            <p>Your order <strong>${input.orderNumber}</strong> has been placed successfully.</p>
            <p>We will call you on <strong>${input.phone}</strong> to confirm delivery.</p>
            <table style="width:100%;border-collapse:collapse;margin:24px 0;color:#fff">
              <thead>
                <tr>
                  <th align="left" style="padding:10px;border-bottom:1px solid #333">Item</th>
                  <th align="left" style="padding:10px;border-bottom:1px solid #333">Qty</th>
                  <th align="left" style="padding:10px;border-bottom:1px solid #333">Price</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
            </table>
            <p><strong>Subtotal:</strong> PKR ${input.subtotal.toLocaleString("en-PK")}</p>
            <p><strong>Total:</strong> PKR ${input.total.toLocaleString("en-PK")}</p>
            <p><strong>Delivery address:</strong> ${input.address}, ${input.city}</p>
            <p style="margin-top:28px;color:#bbb">Contact us: ${input.business.phone} | ${input.business.email}</p>
          </div>
        </div>
      </div>`
  };
}
