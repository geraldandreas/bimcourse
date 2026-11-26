import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, createSessionToken, setSessionCookie, UserRole } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        organization: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Fetch user enrollments
    let enrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: {
        course: {
          include: {
            instructor: { select: { name: true, avatar: true } },
            modules: {
              orderBy: { order: "asc" },
              include: {
                lessons: {
                  orderBy: { order: "asc" },
                },
              },
            },
          },
        },
      },
      orderBy: { enrolledAt: "desc" },
    });

    // Fetch submissions
    const submissions = await prisma.assignmentSubmission.findMany({
      where: { userId: user.id },
      include: {
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch user checkout/payment transactions
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
            thumbnail: true,
            price: true,
            category: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Fetch real DB Certificates (ISSUED shown as active certificates, REQUESTED shown as pending)
    const dbCertificates = await prisma.certificate.findMany({
      where: { userId: user.id },
      include: {
        course: { select: { id: true, title: true, slug: true, category: true } },
      },
      orderBy: { issuedDate: "desc" },
    });

    const certificates = dbCertificates
      .filter((c) => c.status === "ISSUED")
      .map((c) => ({
        id: c.certificateNo || c.id,
        dbId: c.id,
        enrollmentId: c.id,
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        courseSlug: c.course?.slug || "",
        category: c.course?.category || "BIM Course",
        studentName: c.studentName,
        instructorName: c.instructorName,
        ceoName: c.ceoName,
        ceoTitle: c.ceoTitle,
        completedAt: c.issuedDate,
        grade: c.grade,
        standards: c.standards,
        verificationCode: c.certificateNo,
      }));

    const pendingCertificates = dbCertificates
      .filter((c) => c.status === "REQUESTED")
      .map((c) => ({
        id: c.id,
        certificateNo: c.certificateNo,
        courseId: c.courseId,
        courseTitle: c.courseTitle,
        createdAt: c.createdAt,
      }));

    return NextResponse.json({
      success: true,
      user,
      enrollments,
      submissions,
      certificates,
      pendingCertificates,
      transactions,
    });
  } catch (error: any) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "Gagal memuat profil pengguna." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json();
    const { name, avatar, bio, phone, organization } = body;

    if (name !== undefined && !name.trim()) {
      return NextResponse.json({ error: "Nama lengkap tidak boleh kosong." }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...(name && { name: name.trim() }),
        ...(avatar !== undefined && { avatar }),
        ...(bio !== undefined && { bio }),
        ...(phone !== undefined && { phone }),
        ...(organization !== undefined && { organization }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        phone: true,
        organization: true,
        createdAt: true,
      },
    });

    // Refresh JWT session token if name or role changed
    if (name && name.trim() !== session.name) {
      const refreshedToken = await createSessionToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role as UserRole,
      });
      await setSessionCookie(refreshedToken);
    }

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: updatedUser.id,
          action: "PROFILE_UPDATED",
          details: `User ${updatedUser.name} (${updatedUser.email}) updated profile details/avatar.`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: "Profil berhasil diperbarui.",
    });
  } catch (error: any) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "Gagal memperbarui profil pengguna." }, { status: 500 });
  }
}
