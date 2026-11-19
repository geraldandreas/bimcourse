import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, setSessionCookie, UserRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { role } = await req.json();

    const validRoles: UserRole[] = ["superadmin", "admin", "pengajar", "siswa"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Role tidak valid." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { role },
      orderBy: { createdAt: "asc" },
    });

    if (!user) {
      return NextResponse.json(
        { error: `User dengan role ${role} belum terdaftar.` },
        { status: 404 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    await setSessionCookie(token);

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "DEMO_LOGIN",
          details: `Quick demo login as ${role} (${user.email}).`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        organization: user.organization,
      },
    });
  } catch (error: any) {
    console.error("Demo login error:", error);
    return NextResponse.json(
      { error: "Gagal melakukan demo login." },
      { status: 500 }
    );
  }
}
