import nodemailer from "nodemailer";
import dns from "node:dns";
import { IEmailDispatchPayload, IEmailDispatchResult } from "@/types/pdf.types";
import { IOrder } from "@/types/order.types";
import { generateOrderDocuments } from "@/lib/pdf-generator";
import { siteConfig } from "@/config/site.config";

function configureDns() {
  try {
    dns.setDefaultResultOrder?.("ipv4first");
    dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
  } catch {
    // Ignore in restricted environments
  }
}

configureDns();

/**
 * Get configured Nodemailer Transporter
 * Utilizes Gmail SMTP (Free 500 emails/day via Google App Passwords)
 */
function getTransporter() {
  configureDns();
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim().replace(/\s+/g, "");

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user,
      pass,
    },
  });
}

/**
 * Dispatch Order Confirmation Email with PDF Invoice & Lab Certificates
 */
export async function sendOrderInvoiceAndCertificatesEmail(
  payload: IEmailDispatchPayload,
): Promise<IEmailDispatchResult> {
  const transporter = getTransporter();

  // Local development fallback if credentials have not been configured yet
  if (!transporter) {
    console.log(
      `\n[Gmail Dispatch Simulator - Free Mode]` +
        `\nTo: ${payload.to}` +
        `\nRecipient: ${payload.clientName}` +
        `\nOrder: #${payload.orderNumber}` +
        `\nAmount: $${payload.totalAmount.toLocaleString()}` +
        `\nAttachments: Invoice PDF (${payload.invoicePdfBuffer.length} bytes), ${payload.certificatePdfBuffers.length} Lab Certificate(s)` +
        `\nSubject: ${payload.subject || `Order #${payload.orderNumber} Confirmed - Official Invoice & Lab Certificate(s)`}` +
        `\nNote: To dispatch live emails to client Gmail, set GMAIL_USER and GMAIL_APP_PASSWORD in .env.local\n`,
    );

    return {
      success: true,
      messageId: `dev-simulated-${Date.now()}`,
    };
  }

  try {
    const attachments = [
      {
        filename: `Diamond_Vault_Invoice_${payload.orderNumber}.pdf`,
        content: payload.invoicePdfBuffer,
        contentType: "application/pdf",
      },
      ...payload.certificatePdfBuffers.map((cert) => ({
        filename: cert.filename,
        content: cert.buffer,
        contentType: "application/pdf",
      })),
    ];

    const subject =
      payload.subject ||
      `Order #${payload.orderNumber} Confirmed - Official Invoice & Lab Certificate(s) - ${siteConfig.brandName}`;
    const badgeText =
      payload.badgeText || "ORDER PURCHASE SUCCESSFUL • OFFICIAL CERTIFICATION ISSUED";
    const statusTitle =
      payload.statusTitle || `Order #${payload.orderNumber} Confirmed & Certified`;
    const customMessage =
      payload.customMessage ||
      `Thank you for your purchase! Your gemstone order <strong>#${payload.orderNumber}</strong> has been successfully placed. Attached to this email, please find your official <strong>Purchase & Tax Invoice</strong> and official <strong>Lab Authorized Certificate(s) of Authenticity & Grading</strong>.`;
    const fulfillmentStatus =
      payload.fulfillmentStatus || "Payment Confirmed & Invoiced";

    const certCountText =
      payload.certificatePdfBuffers.length === 1
        ? "1 Lab Certificate"
        : `${payload.certificatePdfBuffers.length} Lab Certificates`;

    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f0e0c; color: #f5f5f4; border: 1px solid #332b1a; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #c59b27;">
          <h1 style="color: #e8c567; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">${siteConfig.brandName}</h1>
          <p style="color: #a8a29e; font-size: 11px; margin: 6px 0 0; letter-spacing: 1px;">${badgeText}</p>
        </div>

        <!-- Body -->
        <div style="padding: 32px 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">${statusTitle}</h2>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Dear <strong>${payload.clientName}</strong>,
          </p>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            ${customMessage}
          </p>

          <!-- Order Summary Card -->
          <div style="background-color: #1a1714; border: 1px solid #3d3422; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
              <tr>
                <td style="color: #a8a29e; padding: 6px 0;">Order Reference:</td>
                <td style="color: #ffffff; font-weight: bold; text-align: right; padding: 6px 0;">#${payload.orderNumber}</td>
              </tr>
              <tr>
                <td style="color: #a8a29e; padding: 6px 0;">Acquired Gemstones:</td>
                <td style="color: #ffffff; font-weight: bold; text-align: right; padding: 6px 0;">${payload.itemCount} Gemstone(s)</td>
              </tr>
              <tr>
                <td style="color: #a8a29e; padding: 6px 0;">Total Settlement Paid:</td>
                <td style="color: #e8c567; font-weight: bold; text-align: right; padding: 6px 0; font-size: 16px;">$${payload.totalAmount.toLocaleString()} USD</td>
              </tr>
              <tr>
                <td style="color: #a8a29e; padding: 6px 0;">Order Status:</td>
                <td style="color: #4ade80; font-weight: bold; text-align: right; padding: 6px 0;">${fulfillmentStatus}</td>
              </tr>
            </table>
          </div>

          <p style="color: #e8c567; font-size: 13px; font-weight: bold; margin-bottom: 8px;">
            Attached Official Documentation (${payload.certificatePdfBuffers.length + 1} Attached PDF Document${payload.certificatePdfBuffers.length > 0 ? "s" : ""}):
          </p>
          <ul style="color: #d6d3d1; font-size: 13px; line-height: 1.8; padding-left: 20px; margin-top: 0;">
            <li><strong>Official Purchase & Tax Invoice</strong> (PDF attached)</li>
            <li><strong>Lab Authorized Certificate(s) of Authenticity & Grading</strong> (${certCountText} attached with individual gemstone grading, security seal & verification QR)</li>
          </ul>

          <p style="color: #78716c; font-size: 12px; line-height: 1.5; margin-top: 24px; border-top: 1px solid #292524; padding-top: 16px;">
            If you have any questions regarding your acquisition or certificate authenticity, simply reply directly to this email or reach our master gemologist at ${siteConfig.contact.conciergeEmail}.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #0c0a09; padding: 16px 24px; text-align: center; border-top: 1px solid #292524;">
          <p style="color: #57534e; font-size: 11px; margin: 0;">
            ${siteConfig.contact.legalEntityName} • Solar-Cultivated Laboratory Haute Gemology • 100% Type IIa Certified
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Vault" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject,
      html: htmlBody,
      attachments,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to dispatch email";
    console.error("[Nodemailer Gmail Error]:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Helper to generate order PDF documents (Invoice + Lab Certificates) and send them in one call (DRY)
 */
export async function sendOrderDocumentsEmail(
  order: IOrder,
  options?: {
    subject?: string;
    badgeText?: string;
    statusTitle?: string;
    customMessage?: string;
    fulfillmentStatus?: string;
  },
): Promise<IEmailDispatchResult> {
  const recipientEmail = order.shippingAddress?.email;
  if (!recipientEmail) {
    return {
      success: false,
      error: "No recipient email found in shipping address.",
    };
  }

  const { invoiceBuffer, certificateBuffers } =
    await generateOrderDocuments(order);

  return sendOrderInvoiceAndCertificatesEmail({
    to: recipientEmail,
    clientName: order.shippingAddress?.fullName || "Valued Client",
    orderNumber: order.orderNumber || order.id,
    totalAmount: order.totalAmount || 0,
    itemCount: (order.items || []).length,
    invoicePdfBuffer: invoiceBuffer,
    certificatePdfBuffers: certificateBuffers || [],
    subject: options?.subject,
    badgeText: options?.badgeText,
    statusTitle: options?.statusTitle,
    customMessage: options?.customMessage,
    fulfillmentStatus: options?.fulfillmentStatus,
  });
}

/**
 * Dispatch Order Placement Acknowledgement Email (Pending Curator Approval - No Invoice Attached)
 */
export async function sendOrderReceiptPendingEmail(payload: {
  to: string;
  clientName: string;
  orderNumber: string;
  totalAmount: number;
  itemCount: number;
}): Promise<IEmailDispatchResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `\n[Gmail Dispatch Simulator - Free Mode]` +
        `\nTo: ${payload.to}` +
        `\nRecipient: ${payload.clientName}` +
        `\nOrder Received: #${payload.orderNumber}` +
        `\nStatus: Pending Curator Review (No invoice issued yet)\n`,
    );
    return {
      success: true,
      messageId: `dev-simulated-pending-${Date.now()}`,
    };
  }

  try {
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f0e0c; color: #f5f5f4; border: 1px solid #332b1a; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #c59b27;">
          <h1 style="color: #e8c567; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">${siteConfig.brandName}</h1>
          <p style="color: #a8a29e; font-size: 11px; margin: 6px 0 0; letter-spacing: 1px;">ORDER PLACED • UNDER VERIFICATION</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Order #${payload.orderNumber} Received</h2>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Dear <strong>${payload.clientName}</strong>,
          </p>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Thank you for placing your order with ${siteConfig.brandName}. Your order for <strong>${payload.itemCount} gemstone(s)</strong> totaling <strong>$${payload.totalAmount.toLocaleString()} USD</strong> has been received and is currently being verified by our diamond curation team.
          </p>
          <p style="color: #a8a29e; font-size: 13px; line-height: 1.6; background-color: #1a1714; border: 1px solid #3d3422; padding: 14px; border-radius: 8px;">
            Once your order is reviewed and approved by the vault curator, you will receive your official purchase invoice and certified grading certificates with insured armored transit tracking.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Vault" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Order Received #${payload.orderNumber} - ${siteConfig.brandName}`,
      html: htmlBody,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Failed to dispatch pending email";
    console.error("[Nodemailer Pending Email Error]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatch Order Cancellation Notice Email (No Invoice Attached)
 */
export async function sendOrderCancelledEmail(payload: {
  to: string;
  clientName: string;
  orderNumber: string;
  reason?: string;
}): Promise<IEmailDispatchResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `\n[Gmail Dispatch Simulator - Free Mode]` +
        `\nTo: ${payload.to}` +
        `\nRecipient: ${payload.clientName}` +
        `\nOrder Cancelled: #${payload.orderNumber}` +
        `\nNotice: Order cancelled by curator admin. No invoice generated.\n`,
    );
    return {
      success: true,
      messageId: `dev-simulated-cancel-${Date.now()}`,
    };
  }

  try {
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f0e0c; color: #f5f5f4; border: 1px solid #332b1a; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #e11d48;">
          <h1 style="color: #fda4af; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">${siteConfig.brandName}</h1>
          <p style="color: #a8a29e; font-size: 11px; margin: 6px 0 0; letter-spacing: 1px;">ORDER CANCELLED</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Order #${payload.orderNumber} Has Been Cancelled</h2>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Dear <strong>${payload.clientName}</strong>,
          </p>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Your order #${payload.orderNumber} has been cancelled upon vault curator review (${payload.reason || "Order cancelled by administrator"}).
          </p>
          <p style="color: #fda4af; font-size: 13px; line-height: 1.6; background-color: rgba(225, 29, 72, 0.1); border: 1px solid rgba(225, 29, 72, 0.3); padding: 12px; border-radius: 6px;">
            Please note: No purchase invoice has been issued for this order. Any reservation hold on the selected gemstones has been released.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Vault" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Order #${payload.orderNumber} Cancelled - ${siteConfig.brandName}`,
      html: htmlBody,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Failed to dispatch cancellation email";
    console.error("[Nodemailer Cancellation Email Error]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatch Order Approved Email (In Vault Preparation - No Invoice Attached)
 * Per luxury business rules: Official invoice and lab certificates are ONLY attached
 * once the order is hand-delivered and signed (DELIVERED).
 */
export async function sendOrderApprovedEmail(payload: {
  to: string;
  clientName: string;
  orderNumber: string;
  totalAmount: number;
  itemCount: number;
}): Promise<IEmailDispatchResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `\n[Gmail Dispatch Simulator - Free Mode]` +
        `\nTo: ${payload.to}` +
        `\nRecipient: ${payload.clientName}` +
        `\nOrder Approved: #${payload.orderNumber}` +
        `\nStatus: Approved by Curator & Being Prepared in Vault Atelier (Invoice & certificates will be delivered upon final handover)\n`,
    );
    return {
      success: true,
      messageId: `dev-simulated-approved-${Date.now()}`,
    };
  }

  try {
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f5f5f4; border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #d4af37;">
          <h1 style="color: #e8c567; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">${siteConfig.brandName}</h1>
          <p style="color: #a1a1aa; font-size: 11px; margin: 6px 0 0; letter-spacing: 1px;">ORDER APPROVED • ATELIER PREPARATION</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Order #${payload.orderNumber} Approved by Curator</h2>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
            Dear <strong>${payload.clientName}</strong>,
          </p>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
            We are pleased to inform you that your acquisition of <strong>${payload.itemCount} certified gemstone(s)</strong> totaling <strong>$${payload.totalAmount.toLocaleString()} USD</strong> has been approved by the Head Curator.
          </p>
          <div style="color: #d4af37; font-size: 13px; line-height: 1.6; background-color: #18181b; border: 1px solid #3f3f46; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-weight: 600;">Vault Preparation Protocol Initiated</p>
            <p style="margin: 0; color: #a1a1aa; font-size: 12px;">
              Your stones are currently undergoing secondary gemological inspection and are being prepared for high-security armored dispatch. Your official <strong>Tax Invoice</strong> and <strong>Lab Grading Certificates</strong> will be delivered with your order upon hand-delivery and verified signature.
            </p>
          </div>
          <p style="color: #71717a; font-size: 12px; margin-top: 24px;">
            If you have special delivery instructions or require private salon coordination, please contact our concierge at ${siteConfig.contact.conciergeEmail}.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Vault" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Order #${payload.orderNumber} Approved & In Vault Preparation - ${siteConfig.brandName}`,
      html: htmlBody,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Failed to dispatch approved email";
    console.error("[Nodemailer Approved Email Error]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatch Concierge Consultation Reply Notification Email to Client
 */
export async function sendInquiryReplyNotificationEmail(payload: {
  to: string;
  clientName: string;
  inquiryNumber: string;
  inquiryType: string;
  adminReply: string;
}): Promise<IEmailDispatchResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `\n[Gmail Dispatch Simulator - Free Mode]` +
        `\nTo: ${payload.to}` +
        `\nRecipient: ${payload.clientName}` +
        `\nInquiry Reply: #${payload.inquiryNumber}` +
        `\nCurator Message: "${payload.adminReply.slice(0, 80)}..."\n`,
    );
    return {
      success: true,
      messageId: `dev-simulated-inquiry-reply-${Date.now()}`,
    };
  }

  try {
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; color: #f5f5f4; border: 1px solid #27272a; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #18181b 0%, #09090b 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #d4af37;">
          <h1 style="color: #e8c567; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">${siteConfig.brandName}</h1>
          <p style="color: #a1a1aa; font-size: 11px; margin: 6px 0 0; letter-spacing: 1px;">CONCIERGE CONSULTATION • OFFICIAL RESPONSE</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">New Message on Inquiry #${payload.inquiryNumber}</h2>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
            Dear <strong>${payload.clientName}</strong>,
          </p>
          <p style="color: #d4d4d8; font-size: 14px; line-height: 1.6;">
            Our Lead Gemologist has replied to your inquiry regarding <strong>${payload.inquiryType.replace(/_/g, " ")}</strong>:
          </p>
          <div style="background-color: #18181b; border: 1px solid #3f3f46; border-left: 3px solid #d4af37; padding: 16px; border-radius: 8px; margin: 20px 0; color: #f4f4f5; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">
            ${payload.adminReply}
          </div>
          <div style="text-align: center; margin-top: 28px;">
            <a href="${siteConfig.appUrl}/contact?inquiry=${payload.inquiryNumber}" style="display: inline-block; background-color: #d4af37; color: #09090b; text-decoration: none; font-weight: 600; font-size: 13px; padding: 12px 28px; border-radius: 9999px; letter-spacing: 0.5px;">
              View &amp; Reply in Concierge Portal
            </a>
          </div>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Concierge" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `New Response on Inquiry #${payload.inquiryNumber} - ${siteConfig.brandName}`,
      html: htmlBody,
    });

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    const errorMsg =
      error instanceof Error
        ? error.message
        : "Failed to dispatch inquiry reply email";
    console.error("[Nodemailer Inquiry Reply Email Error]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

export interface IRegistrationEmailPayload {
  to: string;
  clientName: string;
}

export interface IOtpEmailPayload {
  to: string;
  clientName: string;
  otpCode: string;
}

export interface IPasswordUpdatedEmailPayload {
  to: string;
  clientName: string;
}

/**
 * Dispatch Welcome / Registration Success Email
 */
export async function sendRegistrationSuccessEmail(
  payload: IRegistrationEmailPayload
): Promise<IEmailDispatchResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `\n[Gmail Dispatch Simulator - Free Mode]` +
        `\nTo: ${payload.to}` +
        `\nSubject: Welcome to ${siteConfig.brandName} — Private Collector Membership Confirmed` +
        `\nRecipient: ${payload.clientName}\n`
    );
    return { success: true, messageId: `dev-simulated-${Date.now()}` };
  }

  try {
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #0c0a09; color: #f5f5f4; border: 1px solid #292524; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); padding: 36px 24px; text-align: center; border-bottom: 2px solid #d4af37;">
          <h1 style="color: #f5d77f; margin: 0; font-size: 24px; letter-spacing: 3px; text-transform: uppercase;">${siteConfig.brandName}</h1>
          <p style="color: #a8a29e; font-size: 11px; margin: 8px 0 0; letter-spacing: 1.5px; text-transform: uppercase;">Private Collector Vault Membership</p>
        </div>
        <div style="padding: 36px 28px;">
          <h2 style="color: #ffffff; font-size: 20px; font-weight: 300; margin-top: 0;">Welcome, ${payload.clientName}</h2>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.7;">
            Your private client membership with <strong>${siteConfig.brandName}</strong> has been successfully established. You now have unrestricted access to our high-carat solar-cultivated diamonds, live optical cut certifications, and private gemological concierge services.
          </p>
          <div style="background-color: #1c1917; border: 1px solid #332b1a; border-radius: 12px; padding: 20px; margin: 28px 0; text-align: center;">
            <p style="color: #e7c36a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 6px 0;">Membership Status</p>
            <p style="color: #ffffff; font-size: 16px; font-weight: 600; margin: 0;">Active Private Collector</p>
          </div>
          <div style="text-align: center; margin: 32px 0 16px;">
            <a href="${siteConfig.appUrl}/diamonds" style="display: inline-block; background-color: #d4af37; color: #000000 !important; font-weight: 800; font-size: 13px; padding: 14px 36px; border-radius: 8px; border: 1px solid #f5d77f; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
              <span style="color: #000000 !important; font-weight: 800;">Explore Diamond Vault</span>
            </a>
          </div>
          <p style="color: #78716c; font-size: 12px; line-height: 1.6; margin-top: 32px; border-top: 1px solid #292524; padding-top: 20px;">
            For your security, never share your vault credentials. If you did not initiate this account creation, please notify our security bureau immediately.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Vault" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Welcome to ${siteConfig.brandName} — Private Membership Confirmed`,
      html: htmlBody,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to dispatch registration email";
    console.error("[Nodemailer Registration Email Error]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatch One-Time Password (OTP) Verification Email
 */
export async function sendOtpEmail(
  payload: IOtpEmailPayload
): Promise<IEmailDispatchResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `\n[Gmail Dispatch Simulator - Free Mode]` +
        `\nTo: ${payload.to}` +
        `\nSubject: Your ${siteConfig.brandName} Security Code: ${payload.otpCode}` +
        `\nRecipient: ${payload.clientName}` +
        `\nOTP Code: ${payload.otpCode} (Expires in 10 minutes)\n`
    );
    return { success: true, messageId: `dev-simulated-${Date.now()}` };
  }

  try {
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0c0a09; color: #f5f5f4; border: 1px solid #292524; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #d4af37;">
          <h1 style="color: #f5d77f; margin: 0; font-size: 22px; letter-spacing: 3px; text-transform: uppercase;">${siteConfig.brandName}</h1>
          <p style="color: #a8a29e; font-size: 11px; margin: 6px 0 0; letter-spacing: 1.5px; text-transform: uppercase;">Vault Security Verification</p>
        </div>
        <div style="padding: 36px 28px;">
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 300; margin-top: 0;">Verification Code Requested</h2>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Dear <strong>${payload.clientName}</strong>,
          </p>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            A one-time verification code has been requested to access or reset the credentials for your <strong>${siteConfig.brandName}</strong> account.
          </p>
          <div style="background-color: #171412; border: 1px solid #443722; border-radius: 12px; padding: 24px; margin: 28px 0; text-align: center;">
            <p style="color: #a8a29e; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 8px 0;">One-Time Verification Code</p>
            <div style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: 700; letter-spacing: 8px; color: #f5d77f; padding: 6px 0;">
              ${payload.otpCode}
            </div>
            <p style="color: #a8a29e; font-size: 11px; margin: 8px 0 0;">Valid for <strong>10 minutes</strong> only</p>
          </div>
          <p style="color: #a8a29e; font-size: 13px; line-height: 1.6;">
            You may use this code to confirm your identity, log in immediately, or establish a newly updated password.
          </p>
          <p style="color: #78716c; font-size: 12px; line-height: 1.6; margin-top: 28px; border-top: 1px solid #292524; padding-top: 18px;">
            If you did not request this verification code, please ignore this communication. Your credentials remain safe and uncompromised.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Security" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Your ${siteConfig.brandName} Security Verification Code: ${payload.otpCode}`,
      html: htmlBody,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to dispatch OTP email";
    console.error("[Nodemailer OTP Email Error]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatch Password Updated Confirmation Email
 */
export async function sendPasswordUpdatedEmail(
  payload: IPasswordUpdatedEmailPayload
): Promise<IEmailDispatchResult> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `\n[Gmail Dispatch Simulator - Free Mode]` +
        `\nTo: ${payload.to}` +
        `\nSubject: Security Alert: Your ${siteConfig.brandName} Password Has Been Updated` +
        `\nRecipient: ${payload.clientName}\n`
    );
    return { success: true, messageId: `dev-simulated-${Date.now()}` };
  }

  try {
    const htmlBody = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background-color: #0c0a09; color: #f5f5f4; border: 1px solid #292524; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1c1917 0%, #0c0a09 100%); padding: 32px 24px; text-align: center; border-bottom: 2px solid #d4af37;">
          <h1 style="color: #f5d77f; margin: 0; font-size: 22px; letter-spacing: 3px; text-transform: uppercase;">${siteConfig.brandName}</h1>
          <p style="color: #a8a29e; font-size: 11px; margin: 6px 0 0; letter-spacing: 1.5px; text-transform: uppercase;">Security Alert Notice</p>
        </div>
        <div style="padding: 36px 28px;">
          <h2 style="color: #ffffff; font-size: 18px; font-weight: 300; margin-top: 0;">Password Successfully Updated</h2>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Dear <strong>${payload.clientName}</strong>,
          </p>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            The password for your <strong>${siteConfig.brandName}</strong> account was successfully updated on <strong>${new Date().toUTCString()}</strong>.
          </p>
          <div style="background-color: #171412; border: 1px solid #332b1a; border-radius: 12px; padding: 18px; margin: 24px 0;">
            <p style="color: #f5d77f; font-size: 13px; font-weight: 500; margin: 0 0 6px 0;">✓ Security Credential Changed</p>
            <p style="color: #a8a29e; font-size: 12px; margin: 0;">You may now access your account using your newly established password.</p>
          </div>
          <div style="text-align: center; margin: 28px 0 16px;">
            <a href="${siteConfig.appUrl}/login" style="display: inline-block; background-color: #d4af37; color: #000000 !important; font-weight: 800; font-size: 13px; padding: 14px 34px; border-radius: 8px; border: 1px solid #f5d77f; text-decoration: none; letter-spacing: 1px; text-transform: uppercase;">
              <span style="color: #000000 !important; font-weight: 800;">Sign In to Account</span>
            </a>
          </div>
          <p style="color: #ef4444; font-size: 12px; line-height: 1.6; margin-top: 28px; border-top: 1px solid #292524; padding-top: 18px;">
            <strong>Important:</strong> If you did not authorize this change, please contact our security team immediately at concierge@darkgems.luxury to protect your vault.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Security" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Security Alert: Your ${siteConfig.brandName} Password Has Been Updated`,
      html: htmlBody,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to dispatch password updated email";
    console.error("[Nodemailer Password Updated Email Error]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}

/**
 * Dispatch Back-in-Stock Notification Email to Client
 */
export async function sendBackInStockEmail(payload: {
  to: string;
  clientName: string;
  diamond: {
    _id: string;
    name: string;
    sku: string;
    shape: string;
    carat: number;
    color: string;
    clarity: string;
    cut: string;
    finalPrice: number;
    stockQuantity: number;
    images?: string[];
  };
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(
      `\n[Back-in-Stock Email Simulator]` +
        `\nTo: ${payload.to}` +
        `\nRecipient: ${payload.clientName}` +
        `\nSpecimen: ${payload.diamond.name} (${payload.diamond.sku})` +
        `\nPrice: $${payload.diamond.finalPrice.toLocaleString()}` +
        `\nAvailable Stock: ${payload.diamond.stockQuantity}` +
        `\nSubject: Back in Stock: ${payload.diamond.name} (${payload.diamond.sku}) is Now Available` +
        `\nLink: ${siteConfig.appUrl}/diamonds/${payload.diamond._id}\n`
    );
    return { success: true, messageId: `dev-stock-alert-${Date.now()}` };
  }

  try {
    const specimenUrl = `${siteConfig.appUrl}/diamonds/${payload.diamond._id}`;
    const primaryImage =
      payload.diamond.images && payload.diamond.images.length > 0
        ? payload.diamond.images[0]
        : "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80";

    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Back in Stock: ${payload.diamond.name}</title>
      </head>
      <body style="margin: 0; padding: 24px 0; background-color: #000000; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#000000" style="background-color: #000000;">
          <tr>
            <td align="center" style="padding: 12px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#14120f" style="max-width: 600px; background-color: #14120f; border: 1px solid #3d3424; border-radius: 12px; overflow: hidden;">
                
                <!-- Brand Header -->
                <tr>
                  <td align="center" bgcolor="#0d0b09" style="background-color: #0d0b09; padding: 30px 24px; border-bottom: 2px solid #d4af37;">
                    <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: bold; color: #f5d77f; letter-spacing: 3px; text-transform: uppercase; display: block;">${siteConfig.brandName}</span>
                    <span style="font-size: 11px; font-weight: 600; color: #e5e7eb; letter-spacing: 2px; text-transform: uppercase; display: block; margin-top: 8px;">Direct Vault Stock Notification</span>
                  </td>
                </tr>

                <!-- Main Body -->
                <tr>
                  <td style="padding: 32px 28px;">
                    <!-- Headline -->
                    <h2 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0 0 16px 0; line-height: 1.3;">
                      Your Requested Specimen is Back in Stock
                    </h2>

                    <p style="color: #ffffff; font-size: 15px; line-height: 1.6; margin: 0 0 12px 0;">
                      Dear <strong style="color: #f5d77f;">${payload.clientName}</strong>,
                    </p>

                    <p style="color: #f3f4f6; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
                      The rare gemstone specimen you requested to be notified for is now back in stock and available for private acquisition in our foundry vault.
                    </p>

                    <!-- Specimen Showcase Card -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#1c1814" style="background-color: #1c1814; border: 1px solid #4a3e20; border-left: 4px solid #d4af37; border-radius: 8px; margin-bottom: 24px;">
                      <tr>
                        <td align="center" style="padding: 20px 20px 14px 20px;">
                          <img src="${primaryImage}" alt="${payload.diamond.name}" width="300" style="width: 300px; max-width: 100%; height: auto; max-height: 220px; object-fit: cover; border-radius: 8px; border: 1px solid #383127; display: block; margin: 0 auto;" />
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 24px 22px 24px;">
                          <table width="100%" cellpadding="0" cellspacing="0" border="0">
                            <!-- SKU Badge -->
                            <tr>
                              <td>
                                <span style="background-color: #2e2617; color: #fef08a; font-family: 'Courier New', monospace; font-size: 12px; font-weight: 800; padding: 4px 10px; border-radius: 4px; border: 1px solid #ca8a04; display: inline-block;">
                                  ${payload.diamond.sku}
                                </span>
                              </td>
                            </tr>
                            <!-- Specimen Title -->
                            <tr>
                              <td style="padding-top: 10px;">
                                <h3 style="color: #ffffff; font-size: 20px; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 0.3px;">
                                  ${payload.diamond.name}
                                </h3>
                                <p style="color: #f3f4f6; font-size: 13px; line-height: 1.6; margin: 0 0 16px 0;">
                                  <strong style="color: #ffffff;">${payload.diamond.shape}</strong> &bull; 
                                  <strong style="color: #ffffff;">${payload.diamond.carat} Carats</strong> &bull; 
                                  Color <strong style="color: #ffffff;">${payload.diamond.color}</strong> &bull; 
                                  Clarity <strong style="color: #ffffff;">${payload.diamond.clarity}</strong> &bull; 
                                  Cut <strong style="color: #ffffff;">${payload.diamond.cut}</strong>
                                </p>
                              </td>
                            </tr>
                            <!-- Pricing & Availability -->
                            <tr>
                              <td style="border-top: 1px solid #3d3424; padding-top: 16px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                  <tr>
                                    <td align="left" style="vertical-align: middle;">
                                      <span style="color: #d1d5db; font-size: 11px; text-transform: uppercase; font-family: monospace; display: block; font-weight: 600; letter-spacing: 0.5px;">Vault Valuation</span>
                                      <span style="color: #f5d77f; font-size: 24px; font-weight: 800; font-family: monospace; line-height: 1.2;">$${payload.diamond.finalPrice.toLocaleString()} USD</span>
                                    </td>
                                    <td align="right" style="vertical-align: middle;">
                                      <table cellpadding="0" cellspacing="0" border="0">
                                        <tr>
                                          <td bgcolor="#064e3b" style="background-color: #064e3b; border: 1px solid #10b981; border-radius: 20px; padding: 6px 14px;">
                                            <span style="color: #a7f3d0 !important; font-size: 12px; font-weight: 800; font-family: monospace; text-transform: uppercase; letter-spacing: 0.5px;">
                                              &#10003; ${payload.diamond.stockQuantity} In Vault
                                            </span>
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- High-Contrast Bulletproof CTA Button -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 28px 0 16px 0;">
                      <tr>
                        <td align="center">
                          <table cellpadding="0" cellspacing="0" border="0">
                            <tr>
                              <td align="center" bgcolor="#d4af37" style="background-color: #d4af37; border-radius: 8px; padding: 0;">
                                <a href="${specimenUrl}" target="_blank" style="display: block; padding: 16px 38px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; font-weight: 900; color: #000000 !important; text-decoration: none; border-radius: 8px; background-color: #d4af37; border: 2px solid #f5d77f; letter-spacing: 1px; text-transform: uppercase;">
                                  <span style="color: #000000 !important; font-weight: 900; text-decoration: none;">VIEW &amp; ACQUIRE SPECIMEN &rarr;</span>
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>

                    <!-- Targeted Recipient Disclosure -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#171411" style="background-color: #171411; border: 1px solid #2e2617; border-radius: 8px; margin-top: 24px;">
                      <tr>
                        <td style="padding: 14px 18px;">
                          <p style="color: #d6d3d1; font-size: 12px; line-height: 1.6; margin: 0;">
                            <strong style="color: #f5d77f;">&#128274; Exclusive Subscriber Alert:</strong> This private notification was delivered strictly to you because you requested an in-stock alert for specimen <strong>${payload.diamond.sku}</strong>. This email is sent solely to confirmed requestors for this specific specimen and is not broadcast to general clients.
                          </p>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Atelier Footer -->
                <tr>
                  <td align="center" bgcolor="#0b0a08" style="background-color: #0b0a08; padding: 22px; border-top: 1px solid #2e2617;">
                    <p style="color: #9ca3af; font-size: 11px; margin: 0; font-family: monospace; letter-spacing: 0.5px;">
                      ${siteConfig.brandName} Haute Gemology S.A. &bull; Geneva &bull; San Francisco Atelier
                    </p>
                    <p style="color: #6b7280; font-size: 10px; margin: 6px 0 0 0;">
                      Type IIa Solar-Cultivated Diamonds &bull; Zero Earth Displacement
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const info = await transporter.sendMail({
      from: `"${siteConfig.brandName} Curator" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Vault Alert: ${payload.diamond.name} (${payload.diamond.sku}) is Now Back in Stock`,
      html: htmlBody,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    const errorMsg =
      error instanceof Error ? error.message : "Failed to dispatch back-in-stock email";
    console.error("[Nodemailer Back-in-Stock Email Error]:", errorMsg);
    return { success: false, error: errorMsg };
  }
}



