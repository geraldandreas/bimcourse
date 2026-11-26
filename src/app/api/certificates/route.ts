import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorized } from "@/lib/auth";
import { sendNotificationEmail } from "@/lib/emailService";

export const dynamic = "force-dynamic";

function generateCertNo(userId: string, courseId: string) {
  const year = new Date().getFullYear();
  const seed = (userId + courseId)
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(-4)
    .toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BC-${year}-${seed || "BIM"}${rand}`;
}

async function dispatchCertificateEmail(cert: {
  certificateNo: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  instructorName: string;
  ceoName: string;
  ceoTitle: string;
  grade: string;
  standards: string;
  issuedDate: Date;
}) {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000";
  const formattedDate = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(cert.issuedDate));

  const sigPath = path.join(process.cwd(), "public", "ceo-signature.png");
  const hasSig = fs.existsSync(sigPath);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 680px; margin: 0 auto; background: #0f1115; color: #f4f4f5; padding: 28px; border-radius: 16px;">
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #27272a;">
        <h2 style="margin: 0; color: #f59e0b; letter-spacing: 2px; font-size: 18px;">BIMCOURSE ACADEMY</h2>
        <p style="margin: 6px 0 0; font-size: 12px; color: #a1a1aa;">Sertifikat Kompetensi Resmi Anda Telah Diterbitkan</p>
      </div>

      <div style="padding: 24px 0;">
        <p style="font-size: 14px; line-height: 1.6; color: #e4e4e7;">
          Halo <strong>${cert.studentName}</strong>,
        </p>
        <p style="font-size: 14px; line-height: 1.6; color: #d4d4d8;">
          Selamat! Pengajuan sertifikat Anda telah diproses dan resmi diterbitkan oleh tim SuperAdmin BIMCourse Academy.
        </p>

        <div style="background: #ffffff; color: #18181b; border: 3px solid #d97706; border-radius: 14px; padding: 24px; margin: 20px 0; text-align: center;">
          <p style="margin: 0; font-size: 11px; letter-spacing: 2px; color: #71717a; text-transform: uppercase;">Sertifikat Kompetensi Resmi</p>
          <h1 style="margin: 10px 0 6px; font-size: 24px; color: #09090b; text-transform: uppercase;">${cert.studentName}</h1>
          <p style="margin: 4px 0 12px; font-size: 13px; color: #3f3f46;">Telah menyelesaikan program pelatihan:</p>
          <h3 style="margin: 0 0 8px; font-size: 17px; color: #b45309;">${cert.courseTitle}</h3>
          <p style="margin: 0 0 14px; font-size: 11px; color: #52525b;">${cert.standards}</p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 14px; font-size: 12px; color: #3f3f46;">
            <tr>
              <td style="text-align: left; padding: 6px 0;"><strong>No. Sertifikat:</strong> ${cert.certificateNo}</td>
              <td style="text-align: right; padding: 6px 0;"><strong>Predikat:</strong> ${cert.grade}</td>
            </tr>
            <tr>
              <td style="text-align: left; padding: 6px 0;"><strong>Tanggal Terbit:</strong> ${formattedDate}</td>
              <td style="text-align: right; padding: 6px 0;"><strong>Instruktur:</strong> ${cert.instructorName}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding-top: 14px; border-top: 1px solid #e4e4e7; text-align: center;">
            ${
              hasSig
                ? `<img src="cid:ceo-signature" alt="Tanda Tangan CEO" style="max-height: 64px; margin: 0 auto 4px; display: block;" />`
                : ""
            }
            <p style="margin: 0; font-weight: bold; font-size: 13px; color: #09090b;">${cert.ceoName}</p>
            <p style="margin: 2px 0 0; font-size: 11px; color: #71717a;">${cert.ceoTitle}</p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 24px;">
          <a href="${baseUrl}/profile?tab=certificates" style="display: inline-block; background: #f59e0b; color: #09090b; font-weight: bold; text-decoration: none; padding: 12px 22px; border-radius: 10px; font-size: 13px; margin-right: 8px;">
            Buka Sertifikat di BIMCourse
          </a>
          <a href="${baseUrl}/verify-certificate?id=${encodeURIComponent(cert.certificateNo)}" style="display: inline-block; background: #27272a; color: #ffffff; font-weight: bold; text-decoration: none; padding: 12px 20px; border-radius: 10px; font-size: 13px;">
            Verifikasi Online
          </a>
        </div>
      </div>

      <p style="font-size: 11px; color: #71717a; text-align: center; border-top: 1px solid #27272a; padding-top: 14px; margin: 0;">
        Email ini dikirim resmi oleh BIMCourse Academy (bim.courseacad@gmail.com).
      </p>
    </div>
  `;

  return sendNotificationEmail({
    to: cert.studentEmail,
    subject: `[BIMCourse] Sertifikat Kelulusan Resmi Anda: ${cert.courseTitle} (${cert.certificateNo})`,
    html,
    attachments: hasSig
      ? [
          {
            filename: "ceo-signature.png",
            path: sigPath,
            cid: "ceo-signature",
          },
        ]
      : undefined,
  });
}

// GET /api/certificates
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const courseIdParam = searchParams.get("courseId");
    const slugParam = searchParams.get("slug");

    const isAdmin = isAuthorized(session.role, ["superadmin", "admin"]);

    let resolvedCourseId = courseIdParam || undefined;
    if (!resolvedCourseId && slugParam) {
      const foundCourse = await prisma.course.findUnique({
        where: { slug: slugParam },
        select: { id: true },
      });
      if (foundCourse) resolvedCourseId = foundCourse.id;
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        ...(isAdmin ? {} : { userId: session.userId }),
        ...(resolvedCourseId ? { courseId: resolvedCourseId } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, organization: true },
        },
        course: {
          select: { id: true, title: true, slug: true, category: true, instructorName: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ certificates });
  } catch (error: any) {
    console.error("Certificates GET error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memuat data sertifikat." },
      { status: 500 }
    );
  }
}

// POST /api/certificates (Student request OR SuperAdmin manual generate)
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json();
    const isAdmin = isAuthorized(session.role, ["superadmin", "admin"]);

    // Resolve target course
    const targetCourse = await prisma.course.findFirst({
      where: {
        OR: [
          ...(body.courseId ? [{ id: body.courseId }] : []),
          ...(body.courseSlug ? [{ slug: body.courseSlug }] : []),
        ],
      },
      include: {
        instructor: { select: { name: true } },
      },
    });

    if (!targetCourse) {
      return NextResponse.json({ error: "Kursus tidak ditemukan." }, { status: 404 });
    }

    // SuperAdmin manual creation/generation
    if (isAdmin && body.userId) {
      const targetUser = await prisma.user.findUnique({
        where: { id: body.userId },
        select: { id: true, name: true, email: true },
      });
      if (!targetUser) {
        return NextResponse.json({ error: "Mahasiswa tidak ditemukan." }, { status: 404 });
      }

      const existing = await prisma.certificate.findUnique({
        where: { userId_courseId: { userId: targetUser.id, courseId: targetCourse.id } },
      });

      const certNo =
        body.certificateNo?.trim() ||
        existing?.certificateNo ||
        generateCertNo(targetUser.id, targetCourse.id);
      const nextStatus = body.status === "REQUESTED" ? "REQUESTED" : "ISSUED";
      const issuedDate = body.issuedDate ? new Date(body.issuedDate) : new Date();

      const cert = await prisma.certificate.upsert({
        where: { userId_courseId: { userId: targetUser.id, courseId: targetCourse.id } },
        update: {
          certificateNo: certNo,
          studentName: (body.studentName || targetUser.name).trim(),
          studentEmail: (body.studentEmail || targetUser.email).trim(),
          courseTitle: (body.courseTitle || targetCourse.title).trim(),
          instructorName:
            (body.instructorName ||
              targetCourse.instructorName ||
              targetCourse.instructor?.name ||
              "Eddy Tuasikal, S.Ars").trim(),
          ceoName: (body.ceoName || "Eddy Tuasikal, S.Ars").trim(),
          ceoTitle: (body.ceoTitle || "Chief Executive Officer, BIMCourse Academy").trim(),
          grade: (body.grade || "Kompeten / Lulus").trim(),
          standards: (
            body.standards || "SKKNI BIM Level 6 • Mandat PUPR • ISO 19650"
          ).trim(),
          issuedDate,
          status: nextStatus,
          notes: body.notes ?? existing?.notes ?? null,
        },
        create: {
          certificateNo: certNo,
          userId: targetUser.id,
          courseId: targetCourse.id,
          studentName: (body.studentName || targetUser.name).trim(),
          studentEmail: (body.studentEmail || targetUser.email).trim(),
          courseTitle: (body.courseTitle || targetCourse.title).trim(),
          instructorName:
            (body.instructorName ||
              targetCourse.instructorName ||
              targetCourse.instructor?.name ||
              "Eddy Tuasikal, S.Ars").trim(),
          ceoName: (body.ceoName || "Eddy Tuasikal, S.Ars").trim(),
          ceoTitle: (body.ceoTitle || "Chief Executive Officer, BIMCourse Academy").trim(),
          grade: (body.grade || "Kompeten / Lulus").trim(),
          standards: (
            body.standards || "SKKNI BIM Level 6 • Mandat PUPR • ISO 19650"
          ).trim(),
          issuedDate,
          status: nextStatus,
          notes: body.notes || null,
        },
      });

      let emailResult: { success: boolean; provider?: string } | null = null;
      if (body.sendEmail && cert.status === "ISSUED") {
        emailResult = await dispatchCertificateEmail(cert);
        await prisma.certificate.update({
          where: { id: cert.id },
          data: { emailSentAt: new Date() },
        });
      }

      return NextResponse.json({ success: true, certificate: cert, emailResult });
    }

    // Student request certificate after finishing final module
    const student = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true },
    });

    if (!student) {
      return NextResponse.json({ error: "Akun siswa tidak ditemukan." }, { status: 404 });
    }

    const existing = await prisma.certificate.findUnique({
      where: { userId_courseId: { userId: student.id, courseId: targetCourse.id } },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        certificate: existing,
        alreadyExists: true,
        message:
          existing.status === "ISSUED"
            ? "Sertifikat Anda untuk kelas ini sudah diterbitkan!"
            : "Pengajuan sertifikat Anda sudah masuk antrean dan sedang diproses SuperAdmin.",
      });
    }

    // Update enrollment to 100% COMPLETED if present
    try {
      await prisma.enrollment.updateMany({
        where: { userId: student.id, courseId: targetCourse.id },
        data: { progress: 100, status: "COMPLETED" },
      });
    } catch {}

    const cert = await prisma.certificate.create({
      data: {
        certificateNo: generateCertNo(student.id, targetCourse.id),
        userId: student.id,
        courseId: targetCourse.id,
        studentName: student.name,
        studentEmail: student.email,
        courseTitle: targetCourse.title,
        instructorName:
          targetCourse.instructorName ||
          targetCourse.instructor?.name ||
          "Eddy Tuasikal, S.Ars",
        ceoName: "Eddy Tuasikal, S.Ars",
        ceoTitle: "Chief Executive Officer, BIMCourse Academy",
        grade: "Kompeten / Lulus",
        standards: "SKKNI BIM Level 6 • Mandat PUPR • ISO 19650",
        status: "REQUESTED",
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: student.id,
          action: "CERTIFICATE_REQUESTED",
          target: cert.id,
          details: `Siswa ${student.name} mengajukan penerbitan sertifikat untuk kelas "${targetCourse.title}"`,
        },
      });
    } catch {}

    // Notify SuperAdmin email
    try {
      await sendNotificationEmail({
        to: "bim.courseacad@gmail.com",
        subject: `[BIMCourse] Pengajuan Sertifikat Baru: ${student.name} - ${targetCourse.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="margin-top:0;">Pengajuan Sertifikat Mahasiswa Baru</h2>
            <p>Mahasiswa telah menyelesaikan modul akhir kursus dan mengajukan penerbitan sertifikat:</p>
            <ul>
              <li><strong>Nama Mahasiswa:</strong> ${student.name}</li>
              <li><strong>Email:</strong> ${student.email}</li>
              <li><strong>Kelas:</strong> ${targetCourse.title}</li>
              <li><strong>No. Referensi Sementara:</strong> ${cert.certificateNo}</li>
            </ul>
            <p>Silakan buka Dashboard SuperAdmin &gt; tab <strong>Sertifikat</strong> untuk meninjau, mengedit bila perlu, men-generate, dan mengirimkan sertifikat ke siswa.</p>
          </div>
        `,
        replyTo: student.email,
      });
    } catch {}

    return NextResponse.json({
      success: true,
      certificate: cert,
      message: "Pengajuan sertifikat berhasil dikirim! Menunggu proses penerbitan oleh SuperAdmin.",
    });
  } catch (error: any) {
    console.error("Certificates POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengajukan sertifikat." },
      { status: 500 }
    );
  }
}

// PUT /api/certificates (SuperAdmin edit, issue/generate, and send email)
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin"])) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      studentName,
      studentEmail,
      courseTitle,
      certificateNo,
      instructorName,
      ceoName,
      ceoTitle,
      grade,
      standards,
      issuedDate,
      status,
      notes,
      sendEmail,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID sertifikat wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.certificate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Sertifikat tidak ditemukan." }, { status: 404 });
    }

    const nextStatus = status || (sendEmail ? "ISSUED" : existing.status);

    const updated = await prisma.certificate.update({
      where: { id },
      data: {
        ...(studentName !== undefined ? { studentName: studentName.trim() } : {}),
        ...(studentEmail !== undefined ? { studentEmail: studentEmail.trim() } : {}),
        ...(courseTitle !== undefined ? { courseTitle: courseTitle.trim() } : {}),
        ...(certificateNo !== undefined ? { certificateNo: certificateNo.trim() } : {}),
        ...(instructorName !== undefined ? { instructorName: instructorName.trim() } : {}),
        ...(ceoName !== undefined ? { ceoName: ceoName.trim() } : {}),
        ...(ceoTitle !== undefined ? { ceoTitle: ceoTitle.trim() } : {}),
        ...(grade !== undefined ? { grade: grade.trim() } : {}),
        ...(standards !== undefined ? { standards: standards.trim() } : {}),
        ...(issuedDate ? { issuedDate: new Date(issuedDate) } : {}),
        ...(notes !== undefined ? { notes } : {}),
        status: nextStatus,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, organization: true },
        },
        course: {
          select: { id: true, title: true, slug: true, category: true, instructorName: true },
        },
      },
    });

    let emailResult: { success: boolean; provider?: string; error?: string } | null = null;
    let finalCert = updated;

    if (sendEmail && updated.status === "ISSUED") {
      emailResult = await dispatchCertificateEmail(updated);
      if (emailResult.success) {
        finalCert = await prisma.certificate.update({
          where: { id: updated.id },
          data: { emailSentAt: new Date() },
          include: {
            user: {
              select: { id: true, name: true, email: true, phone: true, organization: true },
            },
            course: {
              select: { id: true, title: true, slug: true, category: true, instructorName: true },
            },
          },
        });
      }
    }

    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "CERTIFICATE_UPDATED",
          target: finalCert.id,
          details: `Sertifikat ${finalCert.certificateNo} (${finalCert.studentName}) diperbarui — status: ${finalCert.status}${sendEmail ? " + Email dikirim" : ""}`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      certificate: finalCert,
      emailResult,
      message:
        sendEmail && emailResult?.success
          ? "Sertifikat berhasil diterbitkan ke akun siswa & dikirim ke email!"
          : finalCert.status === "ISSUED"
          ? "Sertifikat resmi berhasil disimpan & aktif di web BIMCourse!"
          : "Data sertifikat berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("Certificates PUT error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memperbarui sertifikat." },
      { status: 500 }
    );
  }
}

// DELETE /api/certificates?id=...
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin"])) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "ID sertifikat wajib diisi." }, { status: 400 });
    }

    await prisma.certificate.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal menghapus sertifikat." },
      { status: 500 }
    );
  }
}
