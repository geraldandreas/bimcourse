import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorized } from "@/lib/auth";
import { DEFAULT_SITE_CONTENT, SiteContentConfig } from "@/data/defaultSiteContent";

const SITE_SETTING_KEY = "homepage_content";

export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: SITE_SETTING_KEY },
    });

    if (!setting || !setting.value) {
      return NextResponse.json({
        success: true,
        content: DEFAULT_SITE_CONTENT,
        isDefault: true,
      });
    }

    try {
      const parsed = JSON.parse(setting.value);
      // Merge with defaults to ensure complete schema integrity
      const merged: SiteContentConfig = {
        sectionsVisibility: {
          ...DEFAULT_SITE_CONTENT.sectionsVisibility,
          ...(parsed.sectionsVisibility || {}),
        },
        hero: {
          ...DEFAULT_SITE_CONTENT.hero,
          ...(parsed.hero || {}),
        },
        community: {
          ...DEFAULT_SITE_CONTENT.community,
          ...(parsed.community || {}),
        },
        instructors:
          Array.isArray(parsed.instructors) && parsed.instructors.length > 0
            ? parsed.instructors.map((pi: any) => {
                const def = DEFAULT_SITE_CONTENT.instructors.find(
                  (di) => di.id === pi.id || (pi.slug && di.slug === pi.slug)
                );
                if (!def) return pi;
                return {
                  ...def,
                  ...pi,
                  slug: pi.slug || def.slug,
                  email: pi.email || def.email,
                  phone: pi.phone || def.phone,
                  location: pi.location || def.location,
                  linkedin: pi.linkedin || def.linkedin,
                  portfolioLink: pi.portfolioLink || def.portfolioLink,
                  bio: pi.bio || def.bio,
                  projects: pi.projects && pi.projects.length > 0 ? pi.projects : def.projects,
                  education: pi.education && pi.education.length > 0 ? pi.education : def.education,
                  workExperience: pi.workExperience && pi.workExperience.length > 0 ? pi.workExperience : def.workExperience,
                  certificates: pi.certificates && pi.certificates.length > 0 ? pi.certificates : def.certificates,
                  achievements: pi.achievements && pi.achievements.length > 0 ? pi.achievements : def.achievements,
                  organizations: pi.organizations && pi.organizations.length > 0 ? pi.organizations : def.organizations,
                  webinars: pi.webinars && pi.webinars.length > 0 ? pi.webinars : def.webinars,
                  softwareSkills: pi.softwareSkills && pi.softwareSkills.length > 0 ? pi.softwareSkills : def.softwareSkills,
                  technicalSkills: pi.technicalSkills && pi.technicalSkills.length > 0 ? pi.technicalSkills : def.technicalSkills,
                  softSkills: pi.softSkills && pi.softSkills.length > 0 ? pi.softSkills : def.softSkills,
                };
              })
            : DEFAULT_SITE_CONTENT.instructors,
        testimonials: {
          ...DEFAULT_SITE_CONTENT.testimonials,
          ...(parsed.testimonials || {}),
          items:
            Array.isArray(parsed.testimonials?.items) && parsed.testimonials.items.length > 0
              ? parsed.testimonials.items
              : DEFAULT_SITE_CONTENT.testimonials.items,
        },
        faq: {
          ...DEFAULT_SITE_CONTENT.faq,
          ...(parsed.faq || {}),
          items:
            Array.isArray(parsed.faq?.items) && parsed.faq.items.length > 0
              ? parsed.faq.items
              : DEFAULT_SITE_CONTENT.faq.items,
        },
      };

      return NextResponse.json({
        success: true,
        content: merged,
        isDefault: false,
        updatedAt: setting.updatedAt,
      });
    } catch {
      return NextResponse.json({
        success: true,
        content: DEFAULT_SITE_CONTENT,
        isDefault: true,
      });
    }
  } catch (error: any) {
    console.error("Fetch site-content error:", error);
    return NextResponse.json(
      { error: "Gagal memuat pengaturan konten web." },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin"])) {
      return NextResponse.json(
        { error: "Hanya SuperAdmin yang memiliki izin mengatur konten website." },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Data konten tidak valid." },
        { status: 400 }
      );
    }

    const serialized = JSON.stringify(body);

    const updated = await prisma.siteSetting.upsert({
      where: { key: SITE_SETTING_KEY },
      update: { value: serialized },
      create: { key: SITE_SETTING_KEY, value: serialized },
    });

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "SITE_CONTENT_UPDATED",
          target: "HOMEPAGE",
          details: `Superadmin updated homepage sections & content settings`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: "Konten website berhasil disimpan dan dipublikasikan!",
      updatedAt: updated.updatedAt,
    });
  } catch (error: any) {
    console.error("Update site-content error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan konten web." },
      { status: 500 }
    );
  }
}
