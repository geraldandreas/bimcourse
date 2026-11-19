import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email wajib disertakan." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: cleanEmail,
    });

    if (error) {
      console.warn("Resend confirmation error:", error.message);
      return NextResponse.json(
        { error: error.message || "Gagal mengirim ulang email konfirmasi." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email konfirmasi berhasil dikirim ulang! Silakan periksa inbox dan spam email Anda.",
    });
  } catch (error: any) {
    console.error("Resend confirmation error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
