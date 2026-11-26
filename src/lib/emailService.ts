import nodemailer from "nodemailer";

const OFFICIAL_EMAIL = "bim.courseacad@gmail.com";

interface SendEmailParams {
  to?: string;
  bcc?: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  attachments?: any[];
}

/**
 * Universal email notification dispatcher for BIMCourse
 * Supports Gmail SMTP (Nodemailer), Resend, or Web3Forms
 */
export async function sendNotificationEmail({
  to = OFFICIAL_EMAIL,
  bcc,
  subject,
  html,
  text,
  replyTo,
  attachments,
}: SendEmailParams): Promise<{ success: boolean; provider: string; error?: string }> {
  // 1. Gmail SMTP via Nodemailer (Free Google App Password)
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ""), // clean spaces in app password
        },
      });

      await transporter.sendMail({
        from: `"BIMCourse Platform" <${smtpUser}>`,
        to,
        ...(bcc ? { bcc } : {}),
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ""),
        replyTo,
        ...(attachments ? { attachments } : {}),
      });

      console.log(`[EMAIL DISPATCHER] Email sent successfully via Gmail SMTP to ${to}${bcc ? ` (BCC: ${Array.isArray(bcc) ? bcc.length : 1})` : ""}`);
      return { success: true, provider: "gmail-smtp" };
    } catch (err: any) {
      console.warn(`[EMAIL DISPATCHER] Gmail SMTP dispatch failed:`, err?.message);
    }
  }

  // 2. Resend API Key
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "BIMCourse Platform <notifications@resend.dev>",
          to: [to],
          ...(bcc ? { bcc: Array.isArray(bcc) ? bcc : [bcc] } : {}),
          subject,
          html,
          text: text || html.replace(/<[^>]*>/g, ""),
          reply_to: replyTo,
        }),
      });

      if (res.ok) {
        console.log(`[EMAIL DISPATCHER] Email sent successfully via Resend to ${to}`);
        return { success: true, provider: "resend" };
      } else {
        const errData = await res.json().catch(() => ({}));
        console.warn(`[EMAIL DISPATCHER] Resend error:`, errData);
      }
    } catch (err: any) {
      console.warn(`[EMAIL DISPATCHER] Resend dispatch failed:`, err?.message);
    }
  }

  // 3. Web3Forms Key (Free email gateway)
  if (process.env.WEB3FORMS_ACCESS_KEY) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          access_key: process.env.WEB3FORMS_ACCESS_KEY,
          subject,
          from_name: "BIMCourse Notifikasi",
          message: html.replace(/<[^>]*>/g, ""),
          to_email: to,
          replyto: replyTo,
        }),
      });

      if (res.ok) {
        console.log(`[EMAIL DISPATCHER] Email sent successfully via Web3Forms to ${to}`);
        return { success: true, provider: "web3forms" };
      }
    } catch (err: any) {
      console.warn(`[EMAIL DISPATCHER] Web3Forms dispatch failed:`, err?.message);
    }
  }

  // 4. Log to server console
  console.log(
    `[EMAIL DISPATCHER LOG] To: ${to} | Subject: "${subject}" | ReplyTo: ${replyTo || "-"}`
  );

  return {
    success: false,
    provider: "none",
    error:
      "Kredensial email belum aktif di .env (tambahkan SMTP_USER & SMTP_PASS dengan Sandi Aplikasi Gmail). Pesan tetap tersimpan aman di database dan muncul di Dashboard SuperAdmin.",
  };
}
