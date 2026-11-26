import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorized } from "@/lib/auth";
import { DEFAULT_SITE_CONTENT, SiteContentConfig } from "@/data/defaultSiteContent";

export const dynamic = "force-dynamic";

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
        features: {
          ...DEFAULT_SITE_CONTENT.features,
          ...(parsed.features || {}),
          card1SoftwareTags: Array.isArray(parsed.features?.card1SoftwareTags)
            ? parsed.features.card1SoftwareTags
            : DEFAULT_SITE_CONTENT.features.card1SoftwareTags,
        },
        courses: {
          ...DEFAULT_SITE_CONTENT.courses,
          ...(parsed.courses || {}),
        },
        roadmaps: {
          ...DEFAULT_SITE_CONTENT.roadmaps,
          ...(parsed.roadmaps || {}),
          tracks: Array.isArray(parsed.roadmaps?.tracks)
            ? parsed.roadmaps.tracks
            : DEFAULT_SITE_CONTENT.roadmaps.tracks,
        },
        community: {
          ...DEFAULT_SITE_CONTENT.community,
          ...(parsed.community || {}),
        },
        instructors: Array.isArray(parsed.instructors)
          ? parsed.instructors.map((pi: any) => {
              const def = DEFAULT_SITE_CONTENT.instructors.find(
                (di) => di.id === pi.id || (pi.slug && di.slug === pi.slug)
              );
              if (!def) return pi;
              return {
                ...def,
                ...pi,
                slug: pi.slug !== undefined ? pi.slug : def.slug,
                email: pi.email !== undefined ? pi.email : def.email,
                phone: pi.phone !== undefined ? pi.phone : def.phone,
                location: pi.location !== undefined ? pi.location : def.location,
                linkedin: pi.linkedin !== undefined ? pi.linkedin : def.linkedin,
                portfolioLink: pi.portfolioLink !== undefined ? pi.portfolioLink : def.portfolioLink,
                bio: pi.bio !== undefined ? pi.bio : def.bio,
                projects: Array.isArray(pi.projects) ? pi.projects : def.projects,
                education: Array.isArray(pi.education) ? pi.education : def.education,
                workExperience: Array.isArray(pi.workExperience) ? pi.workExperience : def.workExperience,
                certificates: Array.isArray(pi.certificates) ? pi.certificates : def.certificates,
                achievements: Array.isArray(pi.achievements) ? pi.achievements : def.achievements,
                organizations: Array.isArray(pi.organizations) ? pi.organizations : def.organizations,
                webinars: Array.isArray(pi.webinars) ? pi.webinars : def.webinars,
                softwareSkills: Array.isArray(pi.softwareSkills) ? pi.softwareSkills : def.softwareSkills,
                technicalSkills: Array.isArray(pi.technicalSkills) ? pi.technicalSkills : def.technicalSkills,
                softSkills: Array.isArray(pi.softSkills) ? pi.softSkills : def.softSkills,
              };
            })
          : DEFAULT_SITE_CONTENT.instructors,
        quiz: {
          ...DEFAULT_SITE_CONTENT.quiz,
          ...(parsed.quiz || {}),
          backgrounds: Array.isArray(parsed.quiz?.backgrounds)
            ? parsed.quiz.backgrounds
            : DEFAULT_SITE_CONTENT.quiz.backgrounds,
          goals: Array.isArray(parsed.quiz?.goals)
            ? parsed.quiz.goals
            : DEFAULT_SITE_CONTENT.quiz.goals,
          recommendations: Array.isArray(parsed.quiz?.recommendations)
            ? parsed.quiz.recommendations
            : DEFAULT_SITE_CONTENT.quiz.recommendations,
        },
        testimonials: {
          ...DEFAULT_SITE_CONTENT.testimonials,
          ...(parsed.testimonials || {}),
          items: Array.isArray(parsed.testimonials?.items)
            ? parsed.testimonials.items
            : DEFAULT_SITE_CONTENT.testimonials.items,
        },
        enterprise: {
          ...DEFAULT_SITE_CONTENT.enterprise,
          ...(parsed.enterprise || {}),
        },
        faq: {
          ...DEFAULT_SITE_CONTENT.faq,
          ...(parsed.faq || {}),
          items: Array.isArray(parsed.faq?.items)
            ? parsed.faq.items
            : DEFAULT_SITE_CONTENT.faq.items,
        },
        cta: {
          ...DEFAULT_SITE_CONTENT.cta,
          ...(parsed.cta || {}),
        },
        footer: {
          ...DEFAULT_SITE_CONTENT.footer,
          ...(parsed.footer || {}),
          popularCourses: Array.isArray(parsed.footer?.popularCourses)
            ? parsed.footer.popularCourses
            : DEFAULT_SITE_CONTENT.footer.popularCourses,
          quickLinks: Array.isArray(parsed.footer?.quickLinks)
            ? parsed.footer.quickLinks
            : DEFAULT_SITE_CONTENT.footer.quickLinks,
        },
        payment: {
          ...DEFAULT_SITE_CONTENT.payment,
          ...(parsed.payment || {}),
          bankAccounts: Array.isArray(parsed.payment?.bankAccounts)
            ? parsed.payment.bankAccounts
            : DEFAULT_SITE_CONTENT.payment?.bankAccounts || [],
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
