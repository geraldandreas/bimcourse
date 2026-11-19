import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, setSessionCookie, UserRole } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");
  const origin = req.nextUrl.origin;

  if (error || !code) {
    return NextResponse.redirect(`${origin}/login?error=Google%20Login%20Dibatalkan`);
  }

  const clientId = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(`${origin}/login?error=Konfigurasi%20Google%20OAuth%20Belum%20Lengkap`);
  }

  try {
    // 1. Exchange authorization code for access & id token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const errData = await tokenRes.text();
      console.error("Google token exchange error:", errData);
      return NextResponse.redirect(`${origin}/login?error=Gagal%20menukar%20token%20Google`);
    }

    const tokenData = await tokenRes.json();
    const idToken = tokenData.id_token;

    // 2. Fetch user profile from Google
    const userRes = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );

    if (!userRes.ok) {
      return NextResponse.redirect(`${origin}/login?error=Gagal%20memvalidasi%20token%20Google`);
    }

    const profile = await userRes.json();
    const cleanEmail = profile.email.toLowerCase().trim();
    const cleanName = profile.name || cleanEmail.split("@")[0];
    const avatar = profile.picture;

    // 3. Find or Create User
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      const randomPasswordHash = await hashPassword(crypto.randomUUID() + "_google_oauth_key");
      user = await prisma.user.create({
        data: {
          name: cleanName,
          email: cleanEmail,
          password: randomPasswordHash,
          role: "siswa", // Default role is siswa
          avatar: avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop`,
          organization: null,
          bio: null,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: "GOOGLE_REGISTER",
            target: user.id,
            details: `Akun baru ${user.email} berhasil didaftarkan via Google OAuth dengan role default siswa.`,
          },
        });
      } catch {}
    } else {
      if (!user.avatar && avatar) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar },
        });
      }
    }

    // 4. Issue session token with current role
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    await setSessionCookie(token);

    // 5. Redirect directly to user's assigned role dashboard
    return NextResponse.redirect(`${origin}/dashboard/${user.role}`);
  } catch (err: any) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/login?error=Terjadi%20kesalahan%20saat%20login%20Google`);
  }
}
