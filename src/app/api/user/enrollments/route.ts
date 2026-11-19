import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ authenticated: false, enrollments: [] }, { status: 200 });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: session.userId,
        status: { in: ["ACTIVE", "COMPLETED"] },
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                id: true,
                name: true,
                avatar: true,
                organization: true,
              },
            },
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
      orderBy: { updatedAt: "desc" },
    });

    // Enrich courses if DB modules are empty by falling back to COURSES curriculum
    const enriched = await Promise.all(
      enrollments.map(async (en) => {
        if (!en.course.modules || en.course.modules.length === 0) {
          try {
            const { COURSES } = await import("@/data/courses");
            const staticCourse = COURSES.find(
              (c) => c.slug === en.course.slug || c.id === en.course.slug
            );
            if (staticCourse?.curriculum) {
              const fallbackModules = staticCourse.curriculum.map((m, idx) => ({
                id: `mod-${idx + 1}`,
                title: m.title,
                duration: m.duration,
                order: idx + 1,
                lessons: m.lessons.map((lessonTitle, lIdx) => ({
                  id: `les-${idx + 1}-${lIdx + 1}`,
                  title: lessonTitle,
                  duration: "25 Menit",
                  videoUrl: null,
                  fileUrl: null,
                  fileName: null,
                  isFree: false,
                  order: lIdx + 1,
                })),
              }));
              return {
                ...en,
                course: {
                  ...en.course,
                  modules: fallbackModules,
                },
              };
            }
          } catch {}
        }
        return en;
      })
    );

    return NextResponse.json({
      authenticated: true,
      enrollments: enriched,
    });
  } catch (error: any) {
    console.error("User enrollments error:", error);
    return NextResponse.json({ authenticated: false, enrollments: [] }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json();
    const { enrollmentId, courseId, progress } = body;

    const whereClause = enrollmentId
      ? { id: enrollmentId }
      : {
          userId_courseId: {
            userId: session.userId,
            courseId: courseId,
          },
        };

    const updated = await prisma.enrollment.update({
      where: whereClause,
      data: {
        ...(typeof progress === "number" ? { progress: Math.min(100, Math.max(0, progress)) } : {}),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, enrollment: updated });
  } catch (error: any) {
    console.error("Update enrollment error:", error);
    return NextResponse.json({ error: "Gagal memperbarui progres kelas." }, { status: 500 });
  }
}
