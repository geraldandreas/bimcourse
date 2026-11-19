import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isAuthorized } from "@/lib/auth";

// GET: fetch submissions (Instructors see their students', Students see theirs, Admins see all)
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let submissions;
    if (session.role === "superadmin" || session.role === "admin") {
      submissions = await prisma.assignmentSubmission.findMany({
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else if (session.role === "pengajar") {
      submissions = await prisma.assignmentSubmission.findMany({
        where: { course: { instructorId: session.userId } },
        include: {
          user: { select: { id: true, name: true, email: true } },
          course: { select: { id: true, title: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      submissions = await prisma.assignmentSubmission.findMany({
        where: { userId: session.userId },
        include: { course: { select: { id: true, title: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    return NextResponse.json({ submissions });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat submission." }, { status: 500 });
  }
}

// PUT: Pengajar or Admin evaluates a submission (grade, feedback, status)
export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin", "pengajar"])) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { id, grade, feedback, status } = await req.json();

    const updated = await prisma.assignmentSubmission.update({
      where: { id },
      data: {
        grade: grade !== undefined ? Number(grade) : undefined,
        feedback: feedback || undefined,
        status: status || undefined,
      },
    });

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "SUBMISSION_EVALUATED",
          target: id,
          details: `Submission evaluated: Status ${status}, Nilai ${grade}`,
        },
      });
    } catch {}

    return NextResponse.json({ success: true, submission: updated });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal menilai tugas." }, { status: 500 });
  }
}

// POST: Student submits assignment / capstone project
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Silakan login terlebih dahulu untuk mengumpulkan tugas." }, { status: 401 });
    }

    const { courseId, title, fileUrl, notes, submissionId, grade, status } = await req.json();

    if (!courseId || !title || !fileUrl) {
      return NextResponse.json({ error: "Data tugas tidak lengkap. Mohon sertakan file tugas." }, { status: 400 });
    }

    // Resolve courseId by id or slug
    let targetCourseId = courseId;
    const foundCourse = await prisma.course.findFirst({
      where: {
        OR: [{ id: courseId }, { slug: courseId }],
      },
    });

    if (foundCourse) {
      targetCourseId = foundCourse.id;
    } else {
      const anyCourse = await prisma.course.findFirst();
      if (anyCourse) {
        targetCourseId = anyCourse.id;
      }
    }

    const finalStatus = status || "PENDING";
    const finalGrade = grade !== undefined && grade !== null ? Number(grade) : null;

    // Check if an existing submission exists for this user, course & title (or by submissionId)
    let existing = null;
    if (submissionId) {
      existing = await prisma.assignmentSubmission.findUnique({
        where: { id: submissionId },
      });
    } else {
      existing = await prisma.assignmentSubmission.findFirst({
        where: {
          userId: session.userId,
          courseId: targetCourseId,
          title: title,
        },
      });
    }

    let submission;
    if (existing) {
      submission = await prisma.assignmentSubmission.update({
        where: { id: existing.id },
        data: {
          fileUrl,
          notes: notes !== undefined ? notes : existing.notes,
          status: finalStatus,
          grade: finalGrade,
          feedback: null,
        },
      });
    } else {
      submission = await prisma.assignmentSubmission.create({
        data: {
          userId: session.userId,
          courseId: targetCourseId,
          title,
          fileUrl,
          notes: notes || null,
          status: finalStatus,
          grade: finalGrade,
        },
      });
    }

    return NextResponse.json({ success: true, submission });
  } catch (error: any) {
    console.error("Submit assignment error:", error);
    return NextResponse.json({ error: "Gagal mengirim tugas: " + (error?.message || "Kesalahan server.") }, { status: 500 });
  }
}
