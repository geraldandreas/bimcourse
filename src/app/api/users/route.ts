import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword, isAuthorized } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin", "admin"])) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        bio: true,
        organization: true,
        phone: true,
        createdAt: true,
        _count: {
          select: {
            enrollments: true,
            taughtCourses: true,
            submissions: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Gagal memuat data pengguna." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !isAuthorized(session.role, ["superadmin"])) {
      return NextResponse.json(
        { error: "Hanya Superadmin yang memiliki izin membuat akun dengan peran tertentu." },
        { status: 403 }
      );
    }

    const { name, email, password, role, organization, bio, phone } = await req.json();

    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: "Nama, email, password, dan role wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "Email sudah terdaftar." }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role,
        organization: organization || null,
        bio: bio || null,
        phone: phone || null,
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      },
    });

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: "USER_CREATED_BY_ADMIN",
          target: newUser.id,
          details: `Superadmin created user ${newUser.name} with role ${newUser.role}`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Gagal membuat user baru." }, { status: 500 });
  }
}
