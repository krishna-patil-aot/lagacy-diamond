import nodemailer from "nodemailer";
import { IEmailDispatchPayload, IEmailDispatchResult } from "@/types/pdf.types";
import { IOrder } from "@/types/order.types";
import { generateOrderDocuments } from "@/lib/pdf-generator";

/**
 * Get configured Nodemailer Transporter
 * Utilizes Gmail SMTP (Free 500 emails/day via Google App Passwords)
 */
function getTransporter() {
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
      `Order #${payload.orderNumber} Confirmed - Official Invoice & Lab Certificate(s) - Legacy Diamond`;
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
          <h1 style="color: #e8c567; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Legacy Diamond Foundry</h1>
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
            If you have any questions regarding your acquisition or certificate authenticity, simply reply directly to this email or reach our master gemologist at concierge@legacydiamond.luxury.
          </p>
        </div>

        <!-- Footer -->
        <div style="background-color: #0c0a09; padding: 16px 24px; text-align: center; border-top: 1px solid #292524;">
          <p style="color: #57534e; font-size: 11px; margin: 0;">
            Legacy Diamond Foundry • Conflict-Free Laboratory Cultivation • 100% Certified
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Legacy Diamond Vault" <${process.env.GMAIL_USER}>`,
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
          <h1 style="color: #e8c567; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Legacy Diamond</h1>
          <p style="color: #a8a29e; font-size: 11px; margin: 6px 0 0; letter-spacing: 1px;">ORDER PLACED • UNDER VERIFICATION</p>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Order #${payload.orderNumber} Received</h2>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Dear <strong>${payload.clientName}</strong>,
          </p>
          <p style="color: #d6d3d1; font-size: 14px; line-height: 1.6;">
            Thank you for placing your order with Legacy Diamond. Your order for <strong>${payload.itemCount} gemstone(s)</strong> totaling <strong>$${payload.totalAmount.toLocaleString()} USD</strong> has been received and is currently being verified by our diamond curation team.
          </p>
          <p style="color: #a8a29e; font-size: 13px; line-height: 1.6; background-color: #1a1714; border: 1px solid #3d3422; padding: 14px; border-radius: 8px;">
            Once your order is reviewed and approved by the vault curator, you will receive your official purchase invoice and certified grading certificates with insured armored transit tracking.
          </p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `"Legacy Diamond Vault" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Order Received #${payload.orderNumber} - Legacy Diamond`,
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
          <h1 style="color: #fda4af; margin: 0; font-size: 24px; letter-spacing: 2px; text-transform: uppercase;">Legacy Diamond</h1>
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
      from: `"Legacy Diamond Vault" <${process.env.GMAIL_USER}>`,
      to: payload.to,
      subject: `Order #${payload.orderNumber} Cancelled - Legacy Diamond`,
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
