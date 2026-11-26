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
  sentBy?: string;
}

// GET: Retrieve newsletter subscribers and broadcast history
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    const isSuperAdmin = session && isAuthorized(session.role, ["superadmin", "admin"]);

    const [subscribersRecord, broadcastsRecord] = await Promise.all([
      prisma.siteSetting.findUnique({ where: { key: SUBSCRIBERS_KEY } }),
      prisma.siteSetting.findUnique({ where: { key: BROADCASTS_KEY } }),
    ]);

    let subscribers: SubscriberItem[] = [];
    if (subscribersRecord?.value) {
      try {
        subscribers = JSON.parse(subscribersRecord.value);
      } catch {
        subscribers = [];
      }
    }

    let broadcasts: BroadcastItem[] = [];
    if (broadcastsRecord?.value) {
      try {
        broadcasts = JSON.parse(broadcastsRecord.value);
      } catch {
        broadcasts = [];
      }
    }

    // If superadmin, return full data
    if (isSuperAdmin) {
      return NextResponse.json({
        success: true,
        totalSubscribers: subscribers.length,
        activeSubscribers: subscribers.filter((s) => s.status === "ACTIVE").length,
        subscribers,
        broadcasts,
        officialEmail: OFFICIAL_EMAIL,
      });
    }

    // Public only gets active count
    return NextResponse.json({
      success: true,
      activeSubscribers: subscribers.filter((s) => s.status === "ACTIVE").length,
    });
  } catch (error: any) {
    console.error("Fetch newsletter error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data buletin." },
      { status: 500 }
    );
  }
}

// POST: Subscribe new email to newsletter
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Format alamat email tidak valid." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Fetch existing subscribers
    const existing = await prisma.siteSetting.findUnique({
      where: { key: SUBSCRIBERS_KEY },
    });

    let subscribers: SubscriberItem[] = [];
    if (existing?.value) {
      try {
        subscribers = JSON.parse(existing.value);
      } catch {
        subscribers = [];
      }
    }

    const found = subscribers.find((s) => s.email.toLowerCase() === cleanEmail);
    if (found) {
      if (found.status === "UNSUBSCRIBED") {
        found.status = "ACTIVE";
        found.subscribedAt = new Date().toISOString();
        await prisma.siteSetting.upsert({
          where: { key: SUBSCRIBERS_KEY },
          update: { value: JSON.stringify(subscribers) },
          create: { key: SUBSCRIBERS_KEY, value: JSON.stringify(subscribers) },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Email Anda sudah terdaftar dalam buletin BIM Tech Digest!",
        alreadySubscribed: true,
      });
    }

    // Append new subscriber
    const newSubscriber: SubscriberItem = {
      id: "sub_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      email: cleanEmail,
      subscribedAt: new Date().toISOString(),
      status: "ACTIVE",
    };

    subscribers.unshift(newSubscriber);

    await prisma.siteSetting.upsert({
      where: { key: SUBSCRIBERS_KEY },
      update: { value: JSON.stringify(subscribers) },
      create: { key: SUBSCRIBERS_KEY, value: JSON.stringify(subscribers) },
    });

    // Send email alert to official email
    try {
      await sendNotificationEmail({
        to: OFFICIAL_EMAIL,
        subject: `[SUBSCRIBER BARU] Pelanggan Buletin BIM Tech Digest: ${cleanEmail}`,
        replyTo: cleanEmail,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #f59e0b; margin-top: 0;">Pelanggan Baru BIM Tech Digest</h2>
            <p>Pengunjung website baru saja mendaftarkan email untuk berlangganan buletin berkala BIMCourse:</p>
            <p style="font-size: 16px; font-weight: bold; padding: 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
              Email: <a href="mailto:${cleanEmail}" style="color: #b45309;">${cleanEmail}</a>
            </p>
            <p style="font-size: 12px; color: #666;">
              Waktu bergabung: ${new Date(newSubscriber.subscribedAt).toLocaleString("id-ID")}<br />
              Total pelanggan saat ini: ${subscribers.length} orang
            </p>
            <p style="margin-top: 20px;">
              Anda dapat mengelola dan menyebarkan info ke seluruh pelanggan melalui menu <b>Buletin & Leads</b> di Dashboard SuperAdmin.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="font-size: 11px; color: #888;">Notifikasi otomatis BIMCourse Indonesia (${OFFICIAL_EMAIL})</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn("Failed to dispatch newsletter email alert:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Terima kasih! Anda berhasil berlangganan buletin BIM Tech Digest.",
      officialEmail: OFFICIAL_EMAIL,
    });
  } catch (error: any) {
    console.error("Subscribe newsletter error:", error);
    return NextResponse.json(
      { error: "Gagal memproses langganan buletin." },
      { status: 500 }
    );
  }
}

// DELETE: Remove or deactivate subscriber (SuperAdmin only)
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin"])) {
      return NextResponse.json(
        { error: "Hanya SuperAdmin yang dapat mengelola daftar subscriber." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const email = searchParams.get("email");

    if (!id && !email) {
      return NextResponse.json(
        { error: "Parameter id atau email diperlukan." },
        { status: 400 }
      );
    }

    const existing = await prisma.siteSetting.findUnique({
      where: { key: SUBSCRIBERS_KEY },
    });

    if (!existing?.value) {
      return NextResponse.json({ success: true, message: "Subscriber dihapus." });
    }

    let subscribers: SubscriberItem[] = JSON.parse(existing.value);
    subscribers = subscribers.filter(
      (s) => (id ? s.id !== id : true) && (email ? s.email.toLowerCase() !== email.toLowerCase() : true)
    );

    await prisma.siteSetting.upsert({
      where: { key: SUBSCRIBERS_KEY },
      update: { value: JSON.stringify(subscribers) },
      create: { key: SUBSCRIBERS_KEY, value: JSON.stringify(subscribers) },
    });

    return NextResponse.json({
      success: true,
      message: "Subscriber berhasil dihapus dari daftar.",
    });
  } catch (error: any) {
    console.error("Delete subscriber error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus subscriber." },
      { status: 500 }
    );
  }
}
