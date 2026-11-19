import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, setSessionCookie, UserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const errorParam = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");
  const origin = requestUrl.origin;

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorParam)}`
    );
  }

  try {
    let authUser: any = null;

    // 1. PKCE Code Exchange (Supabase OAuth & Email Confirmation)
    if (code) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("Supabase code exchange error:", error.message);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent("Gagal memvalidasi sesi otentikasi.")}`
        );
      }
      authUser = data?.user;
    }

    // 2. Token Hash Verification (Email Confirmation Link)
    else if (tokenHash && type) {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as any,
      });
      if (error) {
        console.error("Supabase OTP verify error:", error.message);
        return NextResponse.redirect(
          `${origin}/login?error=${encodeURIComponent("Link konfirmasi tidak valid atau telah kedaluwarsa.")}`
        );
      }
      authUser = data?.user;
    }

    if (!authUser || !authUser.email) {
      // In Supabase OAuth implicit flow, access tokens are sent in the URL hash (#access_token=...)
      // The server does NOT receive URL hash fragments over HTTP.
      // We serve an HTML bridge that extracts window.location.hash in the browser and forwards to /auth/confirm.
      return new NextResponse(
        `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Menghubungkan Akun Google...</title>
</head>
<body style="background:#0F1115;color:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
  <div style="text-align:center;padding:20px;">
    <div style="width:40px;height:40px;border:3px solid rgba(255,255,255,0.2);border-top-color:#ffffff;border-radius:50%;animation:spin 0.8s linear infinite;margin:0 auto 16px auto;"></div>
    <p style="font-size:14px;color:#d1d5db;margin:0;">Menghubungkan akun Google Anda ke BIMCourse...</p>
  </div>
  <style>
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
  <script>
    var hash = window.location.hash;
    var search = window.location.search;
    if (hash && hash.length > 1) {
      window.location.replace('/auth/confirm' + hash);
    } else if (search && search.length > 1) {
      window.location.replace('/auth/confirm' + search);
    } else {
      window.location.replace('/login?error=' + encodeURIComponent('Otentikasi tidak valid. Sesi login tidak ditemukan.'));
    }
  </script>
</body>
</html>`,
        {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    const cleanEmail = authUser.email.toLowerCase().trim();
    const meta = authUser.user_metadata || {};
    const name = meta.name || meta.full_name || cleanEmail.split("@")[0];
    const avatar =
      meta.avatar_url ||
      meta.picture ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop";
    const provider = authUser.app_metadata?.provider || "email";

    // 3. Find or Create User in Prisma PostgreSQL
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // New user from Google -> default role "siswa"
      const randomPasswordHash = await hashPassword(
        crypto.randomUUID() + "_supabase_oauth_auth_token"
      );

      user = await prisma.user.create({
        data: {
          name,
          email: cleanEmail,
          password: randomPasswordHash,
          role: "siswa", // Default role per requirement: Mahasiswa / Siswa
          avatar,
          organization: null,
          bio: null,
          emailConfirmed: true,
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            actorId: user.id,
            action: "USER_REGISTERED_OAUTH",
            details: `User registered via ${provider}: ${user.name} (${user.email})`,
          },
        });
      } catch {}
    } else {
      // Existing user -> update emailConfirmed to true
      if (!user.emailConfirmed) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { emailConfirmed: true },
        });
      }
    }

    // 4. Issue JWT Session Cookie
    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    await setSessionCookie(token);

    // 5. Redirect to destination based on role (siswa -> /profile?tab=edit)
    let targetDashboard = "/profile?tab=edit";
    if (user.role === "superadmin") targetDashboard = "/dashboard/superadmin";
    else if (user.role === "admin") targetDashboard = "/dashboard/admin";
    else if (user.role === "pengajar") targetDashboard = "/dashboard/pengajar";

    return NextResponse.redirect(`${origin}${targetDashboard}`);
  } catch (err: any) {
    console.error("Callback handler exception:", err);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Terjadi kesalahan sistem saat otentikasi.")}`
    );
  }
}
