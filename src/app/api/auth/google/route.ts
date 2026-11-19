import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, setSessionCookie, UserRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    let email = body.email;
    let name = body.name;
    let avatar = body.avatar;
    let googleId = body.googleId;
    const credential = body.credential;

    // If a Google GIS ID token (credential) was provided, verify with Google
    if (credential) {
      try {
        const verifyRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
        );
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          email = payload.email;
          name = payload.name || payload.email.split("@")[0];
          avatar = payload.picture;
          googleId = payload.sub;
        } else {
          // If token verification fails (e.g., invalid/expired), throw error
          return NextResponse.json(
            { error: "Token Google tidak valid atau telah kedaluwarsa." },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error("Google token verification network error:", err);
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email akun Google wajib disertakan." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name?.trim() || cleanEmail.split("@")[0];

    // Check if user already exists in database
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    let isNewUser = false;

    if (!user) {
      // 1. New Google user -> DEFAULT ROLE IS SISWA (per requirement)
      isNewUser = true;
      const randomPasswordHash = await hashPassword(crypto.randomUUID() + "_google_oauth_auth_key");

      user = await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: randomPasswordHash,
          role: "siswa", // Default role: Mahasiswa / Siswa
          avatar: null, // No photo initially; user can upload later
          organization: null,
          bio: null,
          emailConfirmed: true,
        },
      });

      // Audit Log for new Google Registration
      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: "GOOGLE_REGISTER",
            target: user.id,
            details: `Akun baru ${user.email} berhasil didaftarkan via Google Sign-In dengan default role: siswa.`,
          },
        });
      } catch {}
    } else {
      // 2. Existing user -> Keep their assigned role (which may have been modified by SuperAdmin)
      // Update avatar if not set
      if (!user.avatar && avatar) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar },
        });
      }

      // Audit Log for Google Login
      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: "GOOGLE_LOGIN",
            target: user.id,
            details: `User ${user.email} login via Google Sign-In (Role: ${user.role}).`,
          },
        });
      } catch {}
    }

    // Generate JWT session with their active role
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      isNewUser,
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
    console.error("Google Auth API error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses autentikasi Google." },
      { status: 500 }
    );
  }
}
