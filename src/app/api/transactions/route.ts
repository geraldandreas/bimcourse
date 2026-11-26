import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status");

    // Superadmin and Admin can see all transactions
    if (session.role === "superadmin" || session.role === "admin") {
      const transactions = await prisma.transaction.findMany({
        where: {
          ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              phone: true,
              organization: true,
            },
          },
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              thumbnail: true,
              price: true,
              category: true,
              level: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, transactions });
    }

    // Students only see their own transactions
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.userId,
        ...(statusFilter && statusFilter !== "ALL" ? { status: statusFilter } : {}),
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            category: true,
            level: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, transactions });
  } catch (error: any) {
    console.error("Transactions GET error:", error);
    return NextResponse.json({ error: "Gagal mengambil data transaksi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json();
    const { courseId, amount, paymentMethod, proofUrl, senderName, notes } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Kelas yang dipilih wajib dicantumkan." }, { status: 400 });
    }

    if (!proofUrl) {
      return NextResponse.json({ error: "Bukti transfer pembayaran wajib diunggah." }, { status: 400 });
    }

    // Check course existence by ID or Slug
    let course = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
      select: { id: true, title: true, price: true },
    });

    // If course not found in DB yet, check fallback COURSES data and auto-seed it
    if (!course) {
      try {
        const { COURSES } = await import("@/data/courses");
        const staticCourse = COURSES.find((c) => c.id === courseId || c.slug === courseId);
        if (staticCourse) {
          const instructor = await prisma.user.findFirst({
            where: { role: { in: ["pengajar", "superadmin", "admin"] } },
          });

          if (instructor) {
            course = await prisma.course.create({
              data: {
                title: staticCourse.title,
                slug: staticCourse.slug,
                category: staticCourse.category || "modeling",
                level: staticCourse.level || "Beginner",
                isFree: staticCourse.price === 0,
                price: staticCourse.price || 0,
                originalPrice: staticCourse.originalPrice || 0,
                durationHours: staticCourse.durationHours || 20,
                labsCount: Math.round((staticCourse.modulesCount || 4) * 2.5),
                learningMode: "Self-Paced Online",
                language: "Bahasa Indonesia",
                summary: staticCourse.summary || "",
                thumbnail: staticCourse.thumbnail || "",
                badge: staticCourse.badge || "Course",
                instructorId: instructor.id,
              },
              select: { id: true, title: true, price: true },
            });
          }
        }
      } catch (seedErr) {
        console.warn("Course auto-seed error:", seedErr);
      }
    }

    if (!course) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    // Check if user is already enrolled in this course
    const existingEnrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: session.userId,
          courseId: course.id,
        },
      },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Anda sudah terdaftar di kelas ini dan memiliki akses materi." },
        { status: 400 }
      );
    }

    // Check if there is already a PENDING transaction for this course
    const pendingTx = await prisma.transaction.findFirst({
      where: {
        userId: session.userId,
        courseId: course.id,
        status: "PENDING",
      },
    });

    if (pendingTx) {
      return NextResponse.json(
        {
          error:
            "Anda sudah memiliki pengajuan pembayaran untuk kelas ini yang sedang diverifikasi oleh admin.",
        },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.userId,
        courseId: course.id,
        amount: Number(amount) || course.price || 0,
        paymentMethod: paymentMethod || "BANK_TRANSFER",
        proofUrl,
        senderName: senderName || session.name,
        notes: notes || null,
        status: "PENDING",
      },
      include: {
        course: {
          select: { id: true, title: true, price: true },
        },
      },
    });

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "PAYMENT_SUBMITTED",
          target: transaction.id,
          details: `Siswa ${session.name} mengirim bukti transfer pembayaran untuk kelas "${course.title}" sebesar Rp ${(
            transaction.amount
          ).toLocaleString("id-ID")}`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      transaction,
      message: "Bukti transfer berhasil dikirim. Menunggu verifikasi tim admin.",
    });
  } catch (error: any) {
    console.error("Transactions POST error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses pengiriman bukti pembayaran." },
      { status: 500 }
    );
  }
}
