import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, organization, phone } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nama, email, dan password wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password minimal 6 karakter." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check if already in Prisma
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      if (!existing.emailConfirmed) {
        // Resend confirmation email via Supabase
        try {
          await supabase.auth.resend({
            type: "signup",
            email: cleanEmail,
          });
        } catch {}

        return NextResponse.json({
          success: true,
          requireConfirmation: true,
          email: cleanEmail,
          message:
            "Akun sudah terdaftar tapi email belum dikonfirmasi. Kami telah mengirimkan ulang email konfirmasi.",
        });
      }

      return NextResponse.json(
        { error: "Email sudah terdaftar. Silakan login." },
        { status: 409 }
      );
    }

    // Register with Supabase Auth (This triggers Supabase confirmation email)
    const { data: sbData, error: sbError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: password,
      options: {
        data: {
          name,
          organization: organization?.trim() || "",
          phone: phone || "",
        },
      },
    });

    if (sbError) {
      console.warn("Supabase signUp error:", sbError.message);
      if (sbError.message.toLowerCase().includes("already registered")) {
        return NextResponse.json(
          { error: "Email ini sudah terdaftar di sistem otentikasi. Silakan login atau konfirmasi email." },
          { status: 409 }
        );
      }
    }

    const hashedPassword = await hashPassword(password);

    // Save user in Prisma database with emailConfirmed = false
    const user = await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role: "siswa", // Default role for new users
        organization: organization?.trim() || null,
        phone: phone || null,
        emailConfirmed: false, // Must be confirmed via email
        avatar:
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
      },
    });

    // Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          action: "USER_REGISTERED_WAITING_CONFIRMATION",
          details: `Pendaftaran siswa baru menunggu konfirmasi email: ${user.name} (${user.email})`,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      requireConfirmation: true,
      email: cleanEmail,
      message:
        "Pendaftaran berhasil! Silakan periksa inbox atau folder spam email Anda untuk mengonfirmasi akun sebelum login.",
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal melakukan registrasi." },
      { status: 500 }
    );
  }
}
