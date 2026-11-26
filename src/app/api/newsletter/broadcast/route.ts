import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorized } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/emailService";

export const dynamic = "force-dynamic";

const SUBSCRIBERS_KEY = "newsletter_subscribers";
const BROADCASTS_KEY = "newsletter_broadcasts";
const OFFICIAL_EMAIL = "bim.courseacad@gmail.com";

interface SubscriberItem {
  id: string;
  email: string;
  subscribedAt: string;
  status: "ACTIVE" | "UNSUBSCRIBED";
}

interface BroadcastItem {
  id: string;
  subject: string;
  message: string;
  sentAt: string;
  recipientsCount: number;
  sentBy: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin"])) {
      return NextResponse.json(
        { error: "Hanya SuperAdmin yang diizinkan mengirim broadcast buletin." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { subject, message } = body || {};

    if (!subject || !subject.trim() || !message || !message.trim()) {
      return NextResponse.json(
        { error: "Judul subjek dan isi pesan broadcast tidak boleh kosong." },
        { status: 400 }
      );
    }

    // Get active subscribers
    const existingSubs = await prisma.siteSetting.findUnique({
      where: { key: SUBSCRIBERS_KEY },
    });

    let subscribers: SubscriberItem[] = [];
    if (existingSubs?.value) {
      try {
        subscribers = JSON.parse(existingSubs.value);
      } catch {
        subscribers = [];
      }
    }

    const activeList = subscribers.filter((s) => s.status === "ACTIVE");
    if (activeList.length === 0) {
      return NextResponse.json(
        { error: "Belum ada subscriber aktif yang terdaftar untuk menerima broadcast." },
        { status: 400 }
      );
    }

    const emails = activeList.map((s) => s.email);
    const emailsCsv = emails.join(", ");

    // Create broadcast record
    const newBroadcast: BroadcastItem = {
      id: "bc_" + Date.now(),
      subject: subject.trim(),
      message: message.trim(),
      sentAt: new Date().toISOString(),
      recipientsCount: activeList.length,
      sentBy: session.name || "SuperAdmin",
    };

    // Load existing broadcasts
    const existingBc = await prisma.siteSetting.findUnique({
      where: { key: BROADCASTS_KEY },
    });

    let broadcasts: BroadcastItem[] = [];
    if (existingBc?.value) {
      try {
        broadcasts = JSON.parse(existingBc.value);
      } catch {
        broadcasts = [];
      }
    }

    broadcasts.unshift(newBroadcast);

    await prisma.siteSetting.upsert({
      where: { key: BROADCASTS_KEY },
      update: { value: JSON.stringify(broadcasts) },
      create: { key: BROADCASTS_KEY, value: JSON.stringify(broadcasts) },
    });

    // Create audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "NEWSLETTER_BROADCAST_SENT",
          target: "ALL_SUBSCRIBERS",
          details: `Broadcast "${subject}" sent to ${activeList.length} subscribers`,
        },
      });
    } catch {}

    const escapedMessage = message
      .trim()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br />");

    const dispatchResult = await sendNotificationEmail({
      to: OFFICIAL_EMAIL,
      bcc: emails,
      subject: subject.trim(),
      replyTo: OFFICIAL_EMAIL,
      text:
        message.trim() +
        `\n\n---\nAnda menerima email ini karena berlangganan buletin BIM Tech Digest BIMCourse Indonesia (${OFFICIAL_EMAIL}).`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #111827; max-width: 640px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 14px;">
          <div style="border-bottom: 2px solid #f59e0b; padding-bottom: 12px; margin-bottom: 20px;">
            <span style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; color: #b45309;">BIM Tech Digest • BIMCourse Indonesia</span>
            <h2 style="margin: 6px 0 0 0; color: #111827;">${subject.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h2>
          </div>
          <div style="font-size: 14px; color: #374151;">
            ${escapedMessage}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0 16px 0;" />
          <p style="font-size: 11px; color: #6b7280; margin: 0;">
            Anda menerima email ini karena berlangganan buletin <strong>BIM Tech Digest</strong> dari BIMCourse Indonesia (${OFFICIAL_EMAIL}).
          </p>
        </div>
      `,
    });

    // Generate standard mailto distribution URI as optional fallback (Admin uses BCC to protect subscriber privacy)
    const mailtoUrl = `mailto:${OFFICIAL_EMAIL}?bcc=${encodeURIComponent(
      emails.join(",")
    )}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      message +
        "\n\n---\nAnda menerima email ini karena berlangganan buletin BIM Tech Digest BIMCourse Indonesia (bim.courseacad@gmail.com)."
    )}`;

    return NextResponse.json({
      success: true,
      emailSent: dispatchResult.success,
      provider: dispatchResult.provider,
      message: dispatchResult.success
        ? `Broadcast info berhasil dikirim langsung via Email ke ${activeList.length} pelanggan!`
        : `Broadcast info dicatat dan siap dikirim ke ${activeList.length} pelanggan.`,
      broadcast: newBroadcast,
      totalRecipients: activeList.length,
      emailsCsv,
      mailtoUrl,
      officialEmail: OFFICIAL_EMAIL,
    });
  } catch (error: any) {
    console.error("Broadcast newsletter error:", error);
    return NextResponse.json(
      { error: "Gagal menyiapkan broadcast buletin." },
      { status: 500 }
    );
  }
}
