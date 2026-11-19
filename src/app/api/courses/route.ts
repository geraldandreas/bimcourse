import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorized } from "@/lib/auth";
import { BIM_MODULES } from "@/data/bimDocCurriculum";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const publishedOnly = searchParams.get("published") === "true";

    const session = await getSession();
    const canSeeAll = session && isAuthorized(session.role, ["superadmin", "admin"]);

    const courses = await prisma.course.findMany({
      where: publishedOnly || !canSeeAll ? { published: true } : undefined,
      include: {
        instructor: { select: { id: true, name: true, avatar: true, organization: true } },
        modules: {
          include: {
            lessons: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { enrollments: true, submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat kelas." }, { status: 500 });
  }
}

// POST: Superadmin, Admin, or Pengajar creates course with fields and curriculum modules
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin", "pengajar"])) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      category,
      level,
      isFree,
      price,
      originalPrice,
      durationHours,
      labsCount,
      learningMode,
      language,
      summary,
      overview,
      thumbnail,
      badge,
      published,
      attachmentUrl,
      attachmentName,
      attachmentDescription,
      hasInstructorLed,
      instructorName,
      instructorTitle,
      instructorAvatar,
      keyLearnings,
      benefits,
      modules,
      resources,
    } = body;

    if (!title || !category) {
      return NextResponse.json({ error: "Judul dan kategori wajib diisi." }, { status: 400 });
    }

    const courseSlug =
      slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const freeCourse = Boolean(isFree) || Number(price) === 0;

    const newCourse = await prisma.course.create({
      data: {
        title,
        slug: courseSlug,
        category: category || "BIM Modeling",
        level: level || "Intermediate",
        isFree: freeCourse,
        price: freeCourse ? 0 : Number(price || 0),
        originalPrice: freeCourse ? 0 : Number(originalPrice || (price ? price * 2 : 0)),
        durationHours: Number(durationHours || 20),
        labsCount: Number(labsCount || 5),
        learningMode: learningMode || "Self-Paced Online",
        language: language || "Bahasa Indonesia",
        summary: summary || "",
        overview: overview || "",
        thumbnail:
          thumbnail ||
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        badge: badge || (freeCourse ? "Free Course" : "Course"),
        published: session.role === "pengajar" ? false : published !== undefined ? Boolean(published) : true,
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        attachmentDescription: attachmentDescription || null,
        hasInstructorLed: Boolean(hasInstructorLed),
        instructorName: instructorName || null,
        instructorTitle: instructorTitle || null,
        instructorAvatar: instructorAvatar || null,
        keyLearnings: keyLearnings ? (typeof keyLearnings === "string" ? keyLearnings : JSON.stringify(keyLearnings)) : null,
        benefits: benefits ? (typeof benefits === "string" ? benefits : JSON.stringify(benefits)) : null,
        instructorId: session.userId,
        modules: Array.isArray(modules) && modules.length > 0
          ? {
              create: modules.map((m: any, mIdx: number) => ({
                title: m.title || `Modul ${mIdx + 1}`,
                duration: m.duration || "2 Jam",
                order: mIdx + 1,
                lessons: Array.isArray(m.lessons) && m.lessons.length > 0
                  ? {
                      create: m.lessons.map((l: any, lIdx: number) => ({
                        title: l.title || `Pelajaran ${lIdx + 1}`,
                        duration: l.duration || "20 Menit",
                        videoUrl: l.videoUrl || null,
                        fileUrl: l.fileUrl || null,
                        fileName: l.fileName || null,
                        isFree: Boolean(l.isFree),
                        order: lIdx + 1,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        modules: {
          include: { lessons: true },
        },
      },
    });

    // If resources array provided, sync with curriculum SiteSetting
    if (Array.isArray(resources)) {
      try {
        const settingKey = `curriculum_${courseSlug}`;
        const payloadToStore = {
          modules: BIM_MODULES,
          resources,
        };
        await prisma.siteSetting.upsert({
          where: { key: settingKey },
          update: { value: JSON.stringify(payloadToStore) },
          create: { key: settingKey, value: JSON.stringify(payloadToStore) },
        });
      } catch (e) {
        console.error("Failed to sync resources on course create:", e);
      }
    }

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "COURSE_CREATED",
          target: newCourse.id,
          details: `Modul kursus '${newCourse.title}' dibuat oleh ${session.name} (${session.role})`,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, course: newCourse });
  } catch (error: any) {
    console.error("Create course error:", error);
    return NextResponse.json({ error: error.message || "Gagal membuat modul kelas." }, { status: 500 });
  }
}

// PUT: Update course info and curriculum modules
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin", "pengajar"])) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const {
      id,
      published,
      title,
      slug,
      category,
      level,
      isFree,
      price,
      originalPrice,
      durationHours,
      labsCount,
      learningMode,
      language,
      summary,
      overview,
      thumbnail,
      badge,
      attachmentUrl,
      attachmentName,
      attachmentDescription,
      hasInstructorLed,
      instructorName,
      instructorTitle,
      instructorAvatar,
      keyLearnings,
      benefits,
      modules,
      resources,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "ID kelas wajib disertakan." }, { status: 400 });
    }

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Kelas tidak ditemukan." }, { status: 404 });
    }

    const canPublish = isAuthorized(session.role, ["superadmin", "admin"]);
    const isOwner = existing.instructorId === session.userId;

    if (!canPublish && !isOwner) {
      return NextResponse.json({ error: "Anda tidak berhak mengedit kelas ini." }, { status: 403 });
    }

    const freeCourse = isFree !== undefined ? Boolean(isFree) : (price !== undefined ? Number(price) === 0 : existing.isFree);

    // Update using transaction so course and modules stay in sync
    const updated = await prisma.$transaction(async (tx) => {
      const courseUpdate = await tx.course.update({
        where: { id },
        data: {
          ...(title && { title }),
          ...(slug && { slug }),
          ...(category && { category }),
          ...(level && { level }),
          ...(isFree !== undefined && { isFree: freeCourse }),
          ...(price !== undefined && { price: freeCourse ? 0 : Number(price) }),
          ...(originalPrice !== undefined && { originalPrice: Number(originalPrice) }),
          ...(durationHours !== undefined && { durationHours: Number(durationHours) }),
          ...(labsCount !== undefined && { labsCount: Number(labsCount) }),
          ...(learningMode && { learningMode }),
          ...(language && { language }),
          ...(summary && { summary }),
          ...(overview !== undefined && { overview }),
          ...(thumbnail && { thumbnail }),
          ...(badge && { badge }),
          ...(attachmentUrl !== undefined && { attachmentUrl: attachmentUrl || null }),
          ...(attachmentName !== undefined && { attachmentName: attachmentName || null }),
          ...(attachmentDescription !== undefined && { attachmentDescription: attachmentDescription || null }),
          ...(hasInstructorLed !== undefined && { hasInstructorLed: Boolean(hasInstructorLed) }),
          ...(instructorName !== undefined && { instructorName: instructorName || null }),
          ...(instructorTitle !== undefined && { instructorTitle: instructorTitle || null }),
          ...(instructorAvatar !== undefined && { instructorAvatar: instructorAvatar || null }),
          ...(keyLearnings !== undefined && {
            keyLearnings: keyLearnings ? (typeof keyLearnings === "string" ? keyLearnings : JSON.stringify(keyLearnings)) : null,
          }),
          ...(benefits !== undefined && {
            benefits: benefits ? (typeof benefits === "string" ? benefits : JSON.stringify(benefits)) : null,
          }),
          ...(canPublish && published !== undefined && { published: Boolean(published) }),
        },
      });

      // Update modules if array provided
      if (Array.isArray(modules)) {
        // Delete old lessons and modules for this course
        await tx.lesson.deleteMany({
          where: { module: { courseId: id } },
        });
        await tx.module.deleteMany({
          where: { courseId: id },
        });

        // Re-create new modules and lessons
        for (let mIdx = 0; mIdx < modules.length; mIdx++) {
          const m = modules[mIdx];
          await tx.module.create({
            data: {
              courseId: id,
              title: m.title || `Modul ${mIdx + 1}`,
              duration: m.duration || "2 Jam",
              order: mIdx + 1,
              lessons: Array.isArray(m.lessons) && m.lessons.length > 0
                ? {
                    create: m.lessons.map((l: any, lIdx: number) => ({
                      title: l.title || `Pelajaran ${lIdx + 1}`,
                      duration: l.duration || "20 Menit",
                      videoUrl: l.videoUrl || null,
                      fileUrl: l.fileUrl || null,
                      fileName: l.fileName || null,
                      isFree: Boolean(l.isFree),
                      order: lIdx + 1,
                    })),
                  }
                : undefined,
            },
          });
        }
      }

      return courseUpdate;
    });

    // If resources array provided, sync with curriculum SiteSetting
    if (Array.isArray(resources)) {
      try {
        const targetSlug = slug || existing.slug;
        const settingKey = `curriculum_${targetSlug}`;
        const existingSetting = await prisma.siteSetting.findUnique({
          where: { key: settingKey },
        });
        let currentModules = BIM_MODULES;
        if (existingSetting?.value) {
          try {
            const parsed = JSON.parse(existingSetting.value);
            if (Array.isArray(parsed) && parsed.length > 0) currentModules = parsed;
            else if (parsed && typeof parsed === "object" && Array.isArray(parsed.modules)) {
              currentModules = parsed.modules;
            }
          } catch {}
        }
        const payloadToStore = {
          modules: currentModules,
          resources,
        };
        await prisma.siteSetting.upsert({
          where: { key: settingKey },
          update: { value: JSON.stringify(payloadToStore) },
          create: { key: settingKey, value: JSON.stringify(payloadToStore) },
        });
      } catch (e) {
        console.error("Failed to sync resources on course update:", e);
      }
    }

    const fullCourse = await prisma.course.findUnique({
      where: { id },
      include: {
        modules: {
          include: { lessons: { orderBy: { order: "asc" } } },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, course: fullCourse });
  } catch (error: any) {
    console.error("Update course error:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui kelas." }, { status: 500 });
  }
}

// DELETE: Superadmin or Admin can delete course
export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin"])) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID kelas wajib disertakan." }, { status: 400 });
    }

    await prisma.course.delete({ where: { id } });

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "COURSE_DELETED",
          target: id,
          details: `Modul kursus ${id} dihapus oleh ${session.name} (${session.role})`,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, message: "Modul kursus berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menghapus modul kelas." }, { status: 500 });
  }
}
