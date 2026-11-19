const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function importData() {
  try {
    const dumpPath = path.join(__dirname, "sqlite_dump.json");
    if (!fs.existsSync(dumpPath)) {
      console.error("No sqlite_dump.json found!");
      return;
    }

    const data = JSON.parse(fs.readFileSync(dumpPath, "utf-8"));
    console.log("Migrating data to Supabase PostgreSQL...");

    // 1. Users
    if (data.users && data.users.length > 0) {
      console.log(`Importing ${data.users.length} users...`);
      for (const u of data.users) {
        await prisma.user.upsert({
          where: { id: u.id },
          update: {
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            avatar: u.avatar,
            bio: u.bio,
            phone: u.phone,
            organization: u.organization,
          },
          create: {
            id: u.id,
            name: u.name,
            email: u.email,
            password: u.password,
            role: u.role,
            avatar: u.avatar,
            bio: u.bio,
            phone: u.phone,
            organization: u.organization,
            createdAt: new Date(u.createdAt),
            updatedAt: new Date(u.updatedAt),
          },
        });
      }
      console.log("Users imported successfully.");
    }

    // 2. Courses
    if (data.courses && data.courses.length > 0) {
      console.log(`Importing ${data.courses.length} courses...`);
      for (const c of data.courses) {
        await prisma.course.upsert({
          where: { id: c.id },
          update: {
            title: c.title,
            slug: c.slug,
            category: c.category,
            level: c.level,
            isFree: c.isFree,
            price: c.price,
            originalPrice: c.originalPrice,
            durationHours: c.durationHours,
            labsCount: c.labsCount,
            learningMode: c.learningMode,
            language: c.language,
            summary: c.summary,
            overview: c.overview,
            thumbnail: c.thumbnail,
            badge: c.badge,
            published: c.published,
            attachmentUrl: c.attachmentUrl,
            attachmentName: c.attachmentName,
            hasInstructorLed: c.hasInstructorLed,
            instructorName: c.instructorName,
            instructorTitle: c.instructorTitle,
            instructorAvatar: c.instructorAvatar,
            keyLearnings: c.keyLearnings,
            benefits: c.benefits,
            instructorId: c.instructorId,
          },
          create: {
            id: c.id,
            title: c.title,
            slug: c.slug,
            category: c.category,
            level: c.level,
            isFree: c.isFree,
            price: c.price,
            originalPrice: c.originalPrice,
            durationHours: c.durationHours,
            labsCount: c.labsCount,
            learningMode: c.learningMode,
            language: c.language,
            summary: c.summary,
            overview: c.overview,
            thumbnail: c.thumbnail,
            badge: c.badge,
            published: c.published,
            attachmentUrl: c.attachmentUrl,
            attachmentName: c.attachmentName,
            hasInstructorLed: c.hasInstructorLed,
            instructorName: c.instructorName,
            instructorTitle: c.instructorTitle,
            instructorAvatar: c.instructorAvatar,
            keyLearnings: c.keyLearnings,
            benefits: c.benefits,
            instructorId: c.instructorId,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          },
        });

        // Modules & Lessons
        if (c.modules && c.modules.length > 0) {
          for (const m of c.modules) {
            await prisma.module.upsert({
              where: { id: m.id },
              update: {
                title: m.title,
                duration: m.duration,
                order: m.order,
              },
              create: {
                id: m.id,
                courseId: c.id,
                title: m.title,
                duration: m.duration,
                order: m.order,
                createdAt: new Date(m.createdAt),
                updatedAt: new Date(m.updatedAt),
              },
            });

            if (m.lessons && m.lessons.length > 0) {
              for (const l of m.lessons) {
                await prisma.lesson.upsert({
                  where: { id: l.id },
                  update: {
                    title: l.title,
                    duration: l.duration,
                    videoUrl: l.videoUrl,
                    fileUrl: l.fileUrl,
                    fileName: l.fileName,
                    isFree: l.isFree,
                    order: l.order,
                  },
                  create: {
                    id: l.id,
                    moduleId: m.id,
                    title: l.title,
                    duration: l.duration,
                    videoUrl: l.videoUrl,
                    fileUrl: l.fileUrl,
                    fileName: l.fileName,
                    isFree: l.isFree,
                    order: l.order,
                    createdAt: new Date(l.createdAt),
                    updatedAt: new Date(l.updatedAt),
                  },
                });
              }
            }
          }
        }
      }
      console.log("Courses, modules, and lessons imported successfully.");
    }

    // 3. Site Settings (CMS)
    if (data.siteSettings && data.siteSettings.length > 0) {
      console.log(`Importing ${data.siteSettings.length} site settings...`);
      for (const s of data.siteSettings) {
        await prisma.siteSetting.upsert({
          where: { key: s.key },
          update: {
            value: s.value,
          },
          create: {
            key: s.key,
            value: s.value,
            updatedAt: new Date(s.updatedAt),
          },
        });
      }
      console.log("Site settings imported successfully.");
    }

    console.log("All data successfully migrated to Supabase PostgreSQL!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
