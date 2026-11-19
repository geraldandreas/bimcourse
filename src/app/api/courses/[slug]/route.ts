import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    const { slug } = await params;

    const course = await prisma.course.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            bio: true,
            organization: true,
          },
        },
        modules: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: {
          select: {
            enrollments: true,
            submissions: true,
          },
        },
      },
    });

    if (!course) {
      const { COURSES } = await import("@/data/courses");
      const fallback = COURSES.find((c) => c.slug === slug || c.id === slug);
      if (fallback) {
        return NextResponse.json({
          course: {
            id: fallback.id,
            title: fallback.title,
            slug: fallback.slug,
            category: fallback.category,
            level: fallback.level,
            isFree: fallback.price === 0,
            price: fallback.price,
            originalPrice: fallback.originalPrice,
            durationHours: fallback.durationHours,
            labsCount: Math.round(fallback.modulesCount * 2.5),
            learningMode: "Self-Paced Online",
            language: "Bahasa Indonesia",
            summary: fallback.summary,
            overview: fallback.summary,
            thumbnail: fallback.thumbnail,
            badge: fallback.badge || "Course",
            published: true,
            instructor: {
              id: "inst-static",
              name: fallback.instructor.name,
              avatar: fallback.instructor.avatar,
              bio: fallback.instructor.role,
              organization: fallback.instructor.company,
            },
            modules: fallback.curriculum.map((m, idx) => ({
              id: `mod-${idx}`,
              title: m.title,
              duration: m.duration,
              order: idx + 1,
              lessons: m.lessons.map((l, lIdx) => ({
                id: `les-${idx}-${lIdx}`,
                title: l,
                duration: "25 Menit",
                videoUrl: null,
                isFree: lIdx === 0,
                order: lIdx + 1,
              })),
            })),
            _count: {
              enrollments: fallback.studentsCount,
              submissions: Math.round(fallback.studentsCount * 0.4),
            },
          },
        });
      }
      return NextResponse.json({ error: "Modul kursus tidak ditemukan." }, { status: 404 });
    }

    let isEnrolled = false;
    let enrollment = null;

    if (session && course) {
      enrollment = await prisma.enrollment.findUnique({
        where: {
          userId_courseId: {
            userId: session.userId,
            courseId: course.id,
          },
        },
      });
      isEnrolled = !!enrollment;
    }

    return NextResponse.json({
      course,
      isEnrolled,
      enrollment,
      isLoggedIn: Boolean(session),
      currentUser: session ? { userId: session.userId, name: session.name, email: session.email, role: session.role } : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat detail modul kursus." }, { status: 500 });
  }
}
