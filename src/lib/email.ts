import { prisma } from "@/lib/prisma";
import { safeJsonParse } from "@/lib/utils";

type EmailStatus = "SENT" | "FAILED";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  template: string;
};

type OrderEmailBusiness = {
  phone: string;
  email: string;
  address: string;
};

type OrderEmailItem = {
  name: string;
  quantity: number;
  price: number;
};

type OrderConfirmationInput = {
  orderNumber: string;
  customerName: string;
  phone: string;
  address: string;
  city: string;
  items: OrderEmailItem[];
  subtotal: number;
  total: number;
  business: OrderEmailBusiness;
};

type ResolvedMailConfig = {
  fromName: string;
  fromEmail: string;
  from: string;
  adminEmail: string;
};

type AdminOrderAlertInput = OrderConfirmationInput & {
  customerEmail?: string | null;
  notes?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatCurrency(value: number) {
  return `PKR ${Number(value).toLocaleString("en-PK")}`;
}

function getFromEmail() {
  return process.env.RESEND_FROM || "Anmol Gadgets <no-reply@anmolgadgets.com>";
}

function getFallbackFromEmail() {
  return process.env.RESEND_FROM_FALLBACK || "Anmol Gadgets <onboarding@resend.dev>";
}

function getAdminEmail() {
  return process.env.Admin_Mail || process.env.ADMIN_MAIL || process.env.ADMIN_EMAIL || "";
}

function parseFromAddress(value: string) {
  const match = value.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (match) {
    return {
      fromName: match[1].replace(/^"|"$/g, "").trim() || "Anmol Gadgets",
      fromEmail: match[2].trim()
    };
  }
  return {
    fromName: "Anmol Gadgets",
    fromEmail: value.trim()
  };
}

export async function resolveMailConfig(): Promise<ResolvedMailConfig> {
  const [emailSettingsRow, adminMailFromEnv] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { key: "emailSettings" } }),
    Promise.resolve(getAdminEmail())
  ]);

  const settings = emailSettingsRow ? safeJsonParse<Record<string, string>>(emailSettingsRow.value, {}) : {};
  const fallbackFrom = parseFromAddress(getFromEmail());

  const fromName = settings.fromName || fallbackFrom.fromName;
  const fromEmail = settings.fromEmail || fallbackFrom.fromEmail || getFallbackFromEmail();
  const adminEmail = settings.adminMail || adminMailFromEnv;

  return {
    fromName,
    fromEmail,
    from: `${fromName} <${fromEmail}>`,
    adminEmail
  };
}

function getResendApiKey() {
  return process.env.RESEND_API_KEY || "";
}

async function logEmail(params: Pick<EmailPayload, "to" | "subject" | "template">, status: EmailStatus) {
  await prisma.emailLog.create({
    data: {
      toEmail: params.to,
      subject: params.subject,
      template: params.template,
      status,
      sentAt: new Date()
    }
  });
}

function shell(title: string, body: string) {
  return `<!doctype html>
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${escapeHtml(title)}</title>
    </head>
    <body style="margin:0;background:#f5f5f5;color:#111;font-family:Arial,Helvetica,sans-serif;">
      <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(title)}</div>
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f5f5;padding:24px 12px;">
        <tr>
          <td align="center">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:700px;background:#ffffff;border:1px solid #111;border-radius:20px;overflow:hidden;">
              ${body}
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>`;
}

function itemRows(items: OrderEmailItem[]) {
  return items
    .map(
      (item) => `
        <tr>
          <td style="padding:14px 0;border-bottom:1px solid #eaeaea;">
            <div style="font-weight:700;color:#111">${escapeHtml(item.name)}</div>
            <div style="font-size:12px;color:#666;margin-top:4px;">Qty: ${item.quantity}</div>
          </td>
          <td align="right" style="padding:14px 0;border-bottom:1px solid #eaeaea;font-weight:700;color:#111;">${formatCurrency(
            item.price * item.quantity
          )}</td>
        </tr>`
    )
    .join("");
}

export async function sendMail(params: EmailPayload) {
  const apiKey = getResendApiKey();
  if (!apiKey) {
    await logEmail(params, "FAILED");
    throw new Error("Resend API key is not configured");
  }

  const mailConfig = await resolveMailConfig();

  const sendOnce = async (from: string) => {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from,
        to: params.to,
        subject: params.subject,
        html: params.html
      })
    });

    const raw = await response.text();
    return { response, raw };
  };

  const primary = await sendOnce(mailConfig.from || getFromEmail());
  let finalResult = primary;

  if (!primary.response.ok) {
    const shouldRetry =
      primary.response.status === 403 &&
      /not verified|verify your domain|validation_error/i.test(primary.raw);

    if (shouldRetry) {
      finalResult = await sendOnce(getFallbackFromEmail());
    }
  }

  if (!finalResult.response.ok) {
    await logEmail(params, "FAILED");
    throw new Error(`Resend failed: ${finalResult.response.status} ${finalResult.raw}`);
  }

  await logEmail(params, "SENT");
  return finalResult.raw ? JSON.parse(finalResult.raw) : { ok: true };
}

export function buildOrderConfirmationEmail(input: OrderConfirmationInput) {
  const rows = itemRows(input.items);

  return {
    subject: `Order Confirmation ${input.orderNumber} | Anmol Gadgets`,
    html: shell(
      `Order Confirmation ${input.orderNumber}`,
      `
        <tr>
          <td style="background:#111;color:#fff;padding:28px 32px;border-bottom:1px solid #111;">
            <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#d4a843;font-weight:700;">Anmol Gadgets</div>
            <div style="font-size:28px;font-weight:800;margin-top:10px;">Your order is confirmed</div>
            <div style="margin-top:10px;color:#ddd;line-height:1.6;">Order <strong>${escapeHtml(
              input.orderNumber
            )}</strong> has been received. We will call you shortly to confirm delivery.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
              <tr>
                <td style="background:#fafafa;border:1px solid #e5e5e5;border-radius:16px;padding:18px 20px;">
                  <div style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#777;">Customer</div>
                  <div style="font-size:20px;font-weight:800;margin-top:6px;">${escapeHtml(input.customerName)}</div>
                  <div style="color:#555;margin-top:8px;line-height:1.7;">
                    ${escapeHtml(input.phone)}<br/>
                    ${escapeHtml(input.address)}, ${escapeHtml(input.city)}
                  </div>
                </td>
              </tr>
            </table>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
              <tr>
                <td style="font-size:14px;font-weight:800;padding-bottom:10px;">Order Summary</td>
              </tr>
              ${rows}
              <tr>
                <td style="padding-top:16px;font-weight:700;">Subtotal</td>
                <td align="right" style="padding-top:16px;font-weight:700;">${formatCurrency(input.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding-top:8px;font-size:18px;font-weight:900;">Total</td>
                <td align="right" style="padding-top:8px;font-size:18px;font-weight:900;color:#111;">${formatCurrency(
                  input.total
                )}</td>
              </tr>
            </table>
            <div style="margin-top:26px;padding:16px 18px;border-left:4px solid #d4a843;background:#fff9ec;border-radius:12px;color:#4c3b10;line-height:1.7;">
              Cash on Delivery order. Our team will contact you before dispatch.
            </div>
            <div style="margin-top:26px;font-size:13px;color:#666;line-height:1.8;">
              Contact: ${escapeHtml(input.business.phone)}<br/>
              Email: ${escapeHtml(input.business.email)}<br/>
              Address: ${escapeHtml(input.business.address)}
            </div>
          </td>
        </tr>
      `
    )
  };
}

export function buildAdminOrderAlertEmail(input: AdminOrderAlertInput) {
  const rows = itemRows(input.items);

  return {
    subject: `New Order Received ${input.orderNumber} | Anmol Gadgets`,
    html: shell(
      `New Order Received ${input.orderNumber}`,
      `
        <tr>
          <td style="background:#111;color:#fff;padding:28px 32px;border-bottom:1px solid #111;">
            <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#d4a843;font-weight:700;">Admin Alert</div>
            <div style="font-size:28px;font-weight:800;margin-top:10px;">New order placed</div>
            <div style="margin-top:10px;color:#ddd;line-height:1.6;">Order <strong>${escapeHtml(
              input.orderNumber
            )}</strong> is ready for review.</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;">
            <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;">
              <div style="border:1px solid #e5e5e5;border-radius:16px;padding:16px;background:#fafafa;">
                <div style="font-size:12px;color:#777;text-transform:uppercase;letter-spacing:.16em;">Customer</div>
                <div style="font-size:18px;font-weight:800;margin-top:6px;">${escapeHtml(input.customerName)}</div>
                <div style="color:#555;margin-top:6px;line-height:1.7;">${escapeHtml(input.phone)}<br/>${escapeHtml(
                  input.customerEmail || "No email provided"
                )}</div>
              </div>
              <div style="border:1px solid #e5e5e5;border-radius:16px;padding:16px;background:#fafafa;">
                <div style="font-size:12px;color:#777;text-transform:uppercase;letter-spacing:.16em;">Delivery</div>
                <div style="font-size:18px;font-weight:800;margin-top:6px;">${escapeHtml(input.city)}</div>
                <div style="color:#555;margin-top:6px;line-height:1.7;">${escapeHtml(input.address)}</div>
              </div>
            </div>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:24px;">
              <tr>
                <td style="font-size:14px;font-weight:800;padding-bottom:10px;">Items</td>
              </tr>
              ${rows}
              <tr>
                <td style="padding-top:16px;font-weight:700;">Subtotal</td>
                <td align="right" style="padding-top:16px;font-weight:700;">${formatCurrency(input.subtotal)}</td>
              </tr>
              <tr>
                <td style="padding-top:8px;font-size:18px;font-weight:900;">Total</td>
                <td align="right" style="padding-top:8px;font-size:18px;font-weight:900;color:#111;">${formatCurrency(
                  input.total
                )}</td>
              </tr>
            </table>
            <div style="margin-top:26px;padding:16px 18px;border-left:4px solid #111;background:#f7f7f7;border-radius:12px;color:#333;line-height:1.7;">
              <strong>Notes:</strong> ${escapeHtml(input.notes || "No additional notes provided.")}
            </div>
          </td>
        </tr>
      `
    )
  };
}

export function buildTestEmail(input: { title?: string; message?: string; business?: Partial<OrderEmailBusiness> }) {
  return {
    subject: input.title || "Anmol Gadgets Test Email",
    html: shell(
      input.title || "Anmol Gadgets Test Email",
      `
        <tr>
          <td style="background:#111;color:#fff;padding:28px 32px;border-bottom:1px solid #111;">
            <div style="font-size:12px;letter-spacing:.24em;text-transform:uppercase;color:#d4a843;font-weight:700;">Email System</div>
            <div style="font-size:28px;font-weight:800;margin-top:10px;">Test email delivered</div>
            <div style="margin-top:10px;color:#ddd;line-height:1.6;">${escapeHtml(
              input.message || "This is a test message from Anmol Gadgets."
            )}</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 32px;color:#333;line-height:1.8;">
            <div style="font-weight:700;">Business contact</div>
            <div style="margin-top:8px;color:#555;">
              ${escapeHtml(input.business?.phone || "")}<br/>
              ${escapeHtml(input.business?.email || "")}<br/>
              ${escapeHtml(input.business?.address || "")}
            </div>
          </td>
        </tr>
      `
    )
  };
}

export const orderConfirmationEmail = buildOrderConfirmationEmail;
export const adminOrderAlertEmail = buildAdminOrderAlertEmail;
