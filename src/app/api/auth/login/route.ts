import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, setSessionCookie, UserRole } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // Verify Password
    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json(
        { error: "Email atau password salah." },
        { status: 401 }
      );
    }

    // Check email confirmation status (Superadmin bypassed to prevent lock-out)
    if (user.role !== "superadmin" && user.emailConfirmed === false) {
      // Check if user confirmed email in Supabase Auth
      try {
        const { data: sbData, error: sbError } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: password,
        });

        if (sbError) {
          if (sbError.message.toLowerCase().includes("email not confirmed")) {
            return NextResponse.json(
              {
                error:
                  "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk atau spam email Anda dan klik link konfirmasi untuk mengaktifkan akun.",
                requireConfirmation: true,
                email: cleanEmail,
              },
              { status: 403 }
            );
          }
        } else if (sbData?.user?.email_confirmed_at) {
          // User has confirmed in Supabase! Update Prisma status
          await prisma.user.update({
            where: { id: user.id },
            data: { emailConfirmed: true },
          });
          user.emailConfirmed = true;
        }
      } catch (err) {
        console.warn("Supabase auth check note:", err);
      }

      // If still not confirmed
      if (user.emailConfirmed === false) {
        return NextResponse.json(
          {
            error:
              "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk atau spam email Anda dan klik link konfirmasi untuk mengaktifkan akun.",
            requireConfirmation: true,
            email: cleanEmail,
          },
          { status: 403 }
        );
      }
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
    });

    await setSessionCookie(token);

    // Create Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "USER_LOGIN",
          details: `User ${user.email} (${user.role}) logged in successfully.`,
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
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan login." },
      { status: 500 }
    );
  }
}
