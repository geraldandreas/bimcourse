import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("id") || "").trim();

    if (!query) {
      return NextResponse.json({ error: "Kode sertifikat wajib diisi." }, { status: 400 });
    }

    const certificate = await prisma.certificate.findFirst({
      where: {
        status: "ISSUED",
        OR: [{ certificateNo: query }, { id: query }],
      },
      select: {
        id: true,
        certificateNo: true,
        studentName: true,
        courseTitle: true,
        instructorName: true,
        ceoName: true,
        ceoTitle: true,
        grade: true,
        standards: true,
        issuedDate: true,
        status: true,
      },
    });

    if (!certificate) {
      return NextResponse.json(
        { error: "Sertifikat tidak ditemukan atau belum diterbitkan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, certificate });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Gagal memverifikasi sertifikat." },
      { status: 500 }
    );
  }
}
