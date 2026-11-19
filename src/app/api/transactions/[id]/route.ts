import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    // Only superadmin and admin can verify payments
    if (session.role !== "superadmin" && session.role !== "admin") {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya Administrator yang dapat memverifikasi pembayaran." },
        { status: 403 }
      );
    }

    const { id: transactionId } = await params;
    const body = await req.json();
    const { action, rejectionReason } = body; // action: "APPROVE" | "REJECT"

    if (action !== "APPROVE" && action !== "REJECT") {
      return NextResponse.json(
        { error: "Aksi tidak valid. Pilih APPROVE atau REJECT." },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        course: { select: { id: true, title: true } },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Data transaksi tidak ditemukan." }, { status: 404 });
    }

    if (action === "APPROVE") {
      // 1. Update Transaction
      const updatedTx = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: "APPROVED",
          rejectionReason: null,
          verifiedAt: new Date(),
          verifiedById: session.userId,
        },
      });

      // 2. Automatically Enroll the student into the course
      await prisma.enrollment.upsert({
        where: {
          userId_courseId: {
            userId: transaction.userId,
            courseId: transaction.courseId,
          },
        },
        create: {
          userId: transaction.userId,
          courseId: transaction.courseId,
          status: "ACTIVE",
          progress: 0,
        },
        update: {
          status: "ACTIVE",
        },
      });

      // 3. Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            actorId: session.userId,
            action: "PAYMENT_APPROVED",
            target: transaction.id,
            details: `Admin ${session.name} menyetujui pembayaran Rp ${transaction.amount.toLocaleString(
              "id-ID"
            )} dan mengaktifkan kelas "${transaction.course.title}" untuk siswa ${transaction.user.name} (${transaction.user.email}).`,
          },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        transaction: updatedTx,
        message: `Pembayaran berhasil diverifikasi! Kelas "${transaction.course.title}" telah diaktifkan untuk siswa.`,
      });
    } else {
      // Action === REJECT
      const updatedTx = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: "REJECTED",
          rejectionReason: rejectionReason || "Bukti transfer tidak valid atau dana belum diterima.",
          verifiedAt: new Date(),
          verifiedById: session.userId,
        },
      });

      // Audit Log
      try {
        await prisma.auditLog.create({
          data: {
            actorId: session.userId,
            action: "PAYMENT_REJECTED",
            target: transaction.id,
            details: `Admin ${session.name} menolak pembayaran untuk kelas "${transaction.course.title}" (Alasan: ${
              rejectionReason || "Bukti transfer tidak valid"
            }) untuk siswa ${transaction.user.name}.`,
          },
        });
      } catch {}

      return NextResponse.json({
        success: true,
        transaction: updatedTx,
        message: "Pembayaran telah ditolak.",
      });
    }
  } catch (error: any) {
    console.error("Transaction verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses verifikasi transaksi." },
      { status: 500 }
    );
  }
}
