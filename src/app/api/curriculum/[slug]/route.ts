import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorized } from "@/lib/auth";
import { BIM_MODULES, BIM_RESOURCES, CurriculumModule, CurriculumResource } from "@/data/bimDocCurriculum";

export const dynamic = "force-dynamic";

// GET: Load curriculum and resources for course slug
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    // Check SiteSetting for custom stored curriculum
    const settingKey = `curriculum_${slug}`;
    const setting = await prisma.siteSetting.findUnique({
      where: { key: settingKey },
    });

    if (setting?.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return NextResponse.json({
            modules: parsed,
            resources: [],
            isCustom: true,
          });
        } else if (parsed && typeof parsed === "object" && Array.isArray(parsed.modules)) {
          return NextResponse.json({
            modules: parsed.modules,
            resources: Array.isArray(parsed.resources) ? parsed.resources : [],
            isCustom: true,
          });
        }
      } catch {}
    }

    // Default: Return standard modules and empty resources (only show what superadmin uploads)
    return NextResponse.json({
      modules: BIM_MODULES,
      resources: [],
      isCustom: false,
    });
  } catch (error: any) {
    console.error("Fetch curriculum error:", error);
    return NextResponse.json(
      { error: "Gagal memuat kurikulum modul." },
      { status: 500 }
    );
  }
}

// PUT: Save custom authored curriculum & resources (SuperAdmin, Admin, Pengajar)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin", "pengajar"])) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { slug } = await context.params;
    const body = await req.json();
    const { modules, resources } = body;

    if (!Array.isArray(modules)) {
      return NextResponse.json(
        { error: "Format data modul tidak valid." },
        { status: 400 }
      );
    }

    const payloadToStore = {
      modules,
      resources: Array.isArray(resources) ? resources : [],
    };

    const settingKey = `curriculum_${slug}`;
    const jsonString = JSON.stringify(payloadToStore);

    // Upsert to SiteSetting
    await prisma.siteSetting.upsert({
      where: { key: settingKey },
      update: { value: jsonString },
      create: { key: settingKey, value: jsonString },
    });

    // Also update Course summary or module count if course exists in DB
    try {
      const course = await prisma.course.findUnique({ where: { slug } });
      if (course) {
        // Sync course modules count in DB
        const totalLessons = modules.reduce(
          (acc: number, m: any) =>
            acc + (m.sections?.flatMap((s: any) => s.lessons)?.length || 0),
          0
        );
        await prisma.course.update({
          where: { slug },
          data: {
            durationHours: Math.max(10, modules.length * 4),
          },
        });
      }
    } catch {}

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "CURRICULUM_UPDATED",
          target: slug,
          details: `Modul & silabus LMS kursus '${slug}' berhasil diperbarui oleh ${session.name} (${session.role})`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Kurikulum modul kursus berhasil disimpan!",
      modules,
    });
  } catch (error: any) {
    console.error("Save curriculum error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menyimpan kurikulum modul." },
      { status: 500 }
    );
  }
}
