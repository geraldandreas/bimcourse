import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getSession, isAuthorized } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

const BUCKET_NAME = "uploads";

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Akses ditolak. Silakan login terlebih dahulu." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah." }, { status: 400 });
    }

    // Limit size to 100MB
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Ukuran file terlalu besar. Maksimum 100MB." },
        { status: 400 }
      );
    }

    const originalName = file.name || "upload";
    const ext = path.extname(originalName) || "";
    const baseName = path.basename(originalName, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${Date.now()}-${baseName}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Try uploading to Supabase Storage
    try {
      let uploadResult = await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(uniqueFileName, buffer, {
          contentType: file.type || "application/octet-stream",
          upsert: true,
        });

      // If bucket does not exist, auto-create it as public and retry upload
      if (
        uploadResult.error &&
        (uploadResult.error.message?.toLowerCase().includes("not found") ||
          (uploadResult.error as any).statusCode === "404" ||
          (uploadResult.error as any).status === 404)
      ) {
        try {
          await supabaseAdmin.storage.createBucket(BUCKET_NAME, { public: true });
          uploadResult = await supabaseAdmin.storage
            .from(BUCKET_NAME)
            .upload(uniqueFileName, buffer, {
              contentType: file.type || "application/octet-stream",
              upsert: true,
            });
        } catch (createErr) {
          console.warn("Could not auto-create Supabase bucket:", createErr);
        }
      }

      if (!uploadResult.error && uploadResult.data) {
        const { data: publicUrlData } = supabaseAdmin.storage
          .from(BUCKET_NAME)
          .getPublicUrl(uniqueFileName);

        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            url: publicUrlData.publicUrl,
            filename: originalName,
            size: file.size,
            mimeType: file.type,
            provider: "supabase",
          });
        }
      } else if (uploadResult.error) {
        console.warn("Supabase Storage note:", uploadResult.error.message);
      }
    } catch (sbErr: any) {
      console.warn("Supabase Storage fallback triggered:", sbErr?.message);
    }

    // 2. Fallback to local storage (public/uploads)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: originalName,
      size: file.size,
      mimeType: file.type,
      provider: "local",
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal mengunggah file." },
      { status: 500 }
    );
  }
}
