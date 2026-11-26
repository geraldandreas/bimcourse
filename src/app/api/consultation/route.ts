import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorized } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/emailService";

export const dynamic = "force-dynamic";

const INQUIRIES_KEY = "enterprise_inquiries";
const OFFICIAL_EMAIL = "bim.courseacad@gmail.com";
const OFFICIAL_WHATSAPP = "6281524173386";

export interface ConsultationInquiry {
  id: string;
  companyName: string;
  email: string;
  participants: string;
  notes?: string;
  method: "whatsapp" | "email";
  status: "BARU" | "DIPROSES" | "SELESAI";
  createdAt: string;
}

// GET: Retrieve enterprise consultation inquiries (SuperAdmin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin"])) {
      return NextResponse.json(
        { error: "Hanya admin yang memiliki izin melihat data konsultasi korporasi." },
        { status: 403 }
      );
    }

    const record = await prisma.siteSetting.findUnique({
      where: { key: INQUIRIES_KEY },
    });

    let inquiries: ConsultationInquiry[] = [];
    if (record?.value) {
      try {
        inquiries = JSON.parse(record.value);
      } catch {
        inquiries = [];
      }
    }

    return NextResponse.json({
      success: true,
      total: inquiries.length,
      newCount: inquiries.filter((i) => i.status === "BARU").length,
      inquiries,
      officialEmail: OFFICIAL_EMAIL,
      officialWhatsApp: OFFICIAL_WHATSAPP,
    });
  } catch (error: any) {
    console.error("Fetch inquiries error:", error);
    return NextResponse.json(
      { error: "Gagal memuat data konsultasi." },
      { status: 500 }
    );
  }
}

// POST: Public submission for Enterprise In-House Training consultation
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyName, email, participants, notes, method } = body || {};

    if (!companyName || !companyName.trim()) {
      return NextResponse.json(
        { error: "Nama Perusahaan / Instansi wajib diisi." },
        { status: 400 }
      );
    }

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Format email PIC / Perusahaan tidak valid." },
        { status: 400 }
      );
    }

    const newInquiry: ConsultationInquiry = {
      id: "inq_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
      companyName: companyName.trim(),
      email: email.trim().toLowerCase(),
      participants: (participants || "Belum ditentukan").trim(),
      notes: notes ? notes.trim() : undefined,
      method: method === "whatsapp" ? "whatsapp" : "email",
      status: "BARU",
      createdAt: new Date().toISOString(),
    };

    const existing = await prisma.siteSetting.findUnique({
      where: { key: INQUIRIES_KEY },
    });

    let inquiries: ConsultationInquiry[] = [];
    if (existing?.value) {
      try {
        inquiries = JSON.parse(existing.value);
      } catch {
        inquiries = [];
      }
    }

    inquiries.unshift(newInquiry);

    await prisma.siteSetting.upsert({
      where: { key: INQUIRIES_KEY },
      update: { value: JSON.stringify(inquiries) },
      create: { key: INQUIRIES_KEY, value: JSON.stringify(inquiries) },
    });

    // Dispatch email notification to official email
    try {
      await sendNotificationEmail({
        to: OFFICIAL_EMAIL,
        subject: `[LEAD BARU] Konsultasi In-House Training: ${newInquiry.companyName} (${newInquiry.participants})`,
        replyTo: newInquiry.email,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
            <h2 style="color: #b27d56; margin-top: 0;">Permintaan Konsultasi In-House Training Baru</h2>
            <p>Ada perusahaan / instansi yang baru saja mengajukan konsultasi pelatihan BIM melalui website BIMCourse:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold; width: 180px;">Nama Perusahaan:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${newInquiry.companyName}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Email PIC / Bisnis:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${newInquiry.email}">${newInquiry.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Jumlah Peserta:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${newInquiry.participants}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Saluran Pengiriman:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${newInquiry.method.toUpperCase()}</td>
              </tr>
              ${newInquiry.notes ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Kebutuhan Khusus:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${newInquiry.notes}</td>
              </tr>
              ` : ""}
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee; font-weight: bold;">Waktu Pengajuan:</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${new Date(newInquiry.createdAt).toLocaleString("id-ID")}</td>
              </tr>
            </table>
            <p style="margin-top: 20px;">
              <a href="mailto:${newInquiry.email}?subject=Tindak Lanjut Proposal BIM In-House Training - ${encodeURIComponent(newInquiry.companyName)}" style="display: inline-block; padding: 10px 20px; background-color: #b27d56; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Balas Email PIC</a>
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="font-size: 11px; color: #888;">Notifikasi otomatis sistem BIMCourse Indonesia (${OFFICIAL_EMAIL}). Data juga tersimpan di Dashboard SuperAdmin.</p>
          </div>
        `,
      });
    } catch (e) {
      console.warn("Failed to dispatch consultation email alert:", e);
    }

    return NextResponse.json({
      success: true,
      message: "Permintaan konsultasi in-house training berhasil dicatat!",
      inquiry: newInquiry,
      officialEmail: OFFICIAL_EMAIL,
      officialWhatsApp: OFFICIAL_WHATSAPP,
    });
  } catch (error: any) {
    console.error("Submit consultation error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim formulir konsultasi." },
      { status: 500 }
    );
  }
}

// PATCH: Update status of inquiry (e.g., mark as DIPROSES or SELESAI)
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin"])) {
      return NextResponse.json(
        { error: "Hanya SuperAdmin yang diizinkan memperbarui status leads." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id, status } = body || {};

    if (!id || !["BARU", "DIPROSES", "SELESAI"].includes(status)) {
      return NextResponse.json(
        { error: "Data status atau ID tidak valid." },
        { status: 400 }
      );
    }

    const existing = await prisma.siteSetting.findUnique({
      where: { key: INQUIRIES_KEY },
    });

    if (!existing?.value) {
      return NextResponse.json({ error: "Data konsultasi tidak ditemukan." }, { status: 404 });
    }

    let inquiries: ConsultationInquiry[] = JSON.parse(existing.value);
    const item = inquiries.find((i) => i.id === id);
    if (!item) {
      return NextResponse.json({ error: "Lead tidak ditemukan." }, { status: 404 });
    }

    item.status = status;

    await prisma.siteSetting.upsert({
      where: { key: INQUIRIES_KEY },
      update: { value: JSON.stringify(inquiries) },
      create: { key: INQUIRIES_KEY, value: JSON.stringify(inquiries) },
    });

    return NextResponse.json({
      success: true,
      message: `Status konsultasi berhasil diubah ke ${status}.`,
    });
  } catch (error: any) {
    console.error("Update consultation status error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui status konsultasi." },
      { status: 500 }
    );
  }
}

// DELETE: Delete consultation inquiry
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin"])) {
      return NextResponse.json(
        { error: "Hanya SuperAdmin yang diizinkan menghapus leads konsultasi." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Parameter id wajib disertakan." }, { status: 400 });
    }

    const existing = await prisma.siteSetting.findUnique({
      where: { key: INQUIRIES_KEY },
    });

    if (!existing?.value) {
      return NextResponse.json({ success: true });
    }

    let inquiries: ConsultationInquiry[] = JSON.parse(existing.value);
    inquiries = inquiries.filter((i) => i.id !== id);

    await prisma.siteSetting.upsert({
      where: { key: INQUIRIES_KEY },
      update: { value: JSON.stringify(inquiries) },
      create: { key: INQUIRIES_KEY, value: JSON.stringify(inquiries) },
    });

    return NextResponse.json({
      success: true,
      message: "Lead konsultasi berhasil dihapus.",
    });
  } catch (error: any) {
    console.error("Delete consultation error:", error);
    return NextResponse.json(
      { error: "Gagal menghapus lead konsultasi." },
      { status: 500 }
    );
  }
}
