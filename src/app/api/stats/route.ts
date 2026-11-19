import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { role, userId } = session;

    if (role === "superadmin" || role === "admin") {
      const [
        totalUsers,
        superadmins,
        admins,
        instructors,
        students,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalSubmissions,
        recentLogs,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { role: "superadmin" } }),
        prisma.user.count({ where: { role: "admin" } }),
        prisma.user.count({ where: { role: "pengajar" } }),
        prisma.user.count({ where: { role: "siswa" } }),
        prisma.course.count(),
        prisma.course.count({ where: { published: true } }),
        prisma.enrollment.count(),
        prisma.assignmentSubmission.count(),
        prisma.auditLog.findMany({
          take: 8,
          orderBy: { createdAt: "desc" },
          include: { actor: { select: { name: true, email: true, role: true } } },
        }),
      ]);

      return NextResponse.json({
        role,
        metrics: {
          totalUsers,
          superadmins,
          admins,
          instructors,
          students,
          totalCourses,
          publishedCourses,
          draftCourses: totalCourses - publishedCourses,
          totalEnrollments,
          totalSubmissions,
          estimatedRevenue: totalEnrollments * 499000,
        },
        recentLogs,
      });
    }

    if (role === "pengajar") {
      const [myCourses, myStudentsCount, pendingSubmissions] = await Promise.all([
        prisma.course.findMany({
          where: { instructorId: userId },
          include: {
            _count: { select: { enrollments: true, modules: true, submissions: true } },
          },
        }),
        prisma.enrollment.count({
          where: { course: { instructorId: userId } },
        }),
        prisma.assignmentSubmission.findMany({
          where: { course: { instructorId: userId }, status: "PENDING" },
          include: {
            user: { select: { name: true, email: true } },
            course: { select: { title: true } },
          },
        }),
      ]);

      return NextResponse.json({
        role,
        myCourses,
        myStudentsCount,
        pendingSubmissions,
      });
    }

    if (role === "siswa") {
      const [myEnrollments, mySubmissions] = await Promise.all([
        prisma.enrollment.findMany({
          where: { userId },
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
        }),
        prisma.assignmentSubmission.findMany({
          where: { userId },
          include: {
            course: { select: { title: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      const completedCount = myEnrollments.filter((e) => e.progress >= 100).length;

      return NextResponse.json({
        role,
        enrolledCount: myEnrollments.length,
        completedCount,
        myEnrollments,
        mySubmissions,
      });
    }

    return NextResponse.json({ error: "Role tidak dikenali." }, { status: 400 });
  } catch (error: any) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Gagal memuat statistik." }, { status: 500 });
  }
}
