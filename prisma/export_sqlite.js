const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");

const prisma = new PrismaClient();

async function exportData() {
  try {
    console.log("Reading data from SQLite...");
    const users = await prisma.user.findMany();
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });
    const enrollments = await prisma.enrollment.findMany();
    const submissions = await prisma.assignmentSubmission.findMany();
    const auditLogs = await prisma.auditLog.findMany();
    let siteSettings = [];
    try {
      siteSettings = await prisma.siteSetting.findMany();
    } catch (e) {
      console.log("SiteSetting read error or empty:", e.message);
    }

    const dump = {
      users,
      courses,
      enrollments,
      submissions,
      auditLogs,
      siteSettings,
    };

    const dumpPath = path.join(__dirname, "sqlite_dump.json");
    fs.writeFileSync(dumpPath, JSON.stringify(dump, null, 2));
    console.log(`Successfully exported data to ${dumpPath}`);
    console.log(`Users: ${users.length}, Courses: ${courses.length}, SiteSettings: ${siteSettings.length}`);
  } catch (err) {
    console.error("Export failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
