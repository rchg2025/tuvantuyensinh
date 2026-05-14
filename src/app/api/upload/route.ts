import { NextRequest, NextResponse } from "next/server";
import { uploadToDrive } from "@/lib/gdrive";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    let file: File | null = null;
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        file = value;
        break;
      }
    }

    if (!file) {
      return NextResponse.json({ success: false, error: "Không có file nào được tải lên" }, { status: 400 });
    }

    const res = await uploadToDrive(file, file.name, file.type);
    
    let finalUrl = res.url;
    // We use thumbnail for images to avoid uc?export issues
    if (file.type.startsWith("image/") && finalUrl.includes('drive.google.com/uc')) {
      finalUrl = finalUrl.replace('/uc?export=view&id=', '/thumbnail?id=').concat('&sz=w1600');
    }

    return NextResponse.json({
      success: true,
      time: new Date().toISOString(),
      data: {
        baseurl: "",
        messages: [],
        isImages: [file.type.startsWith("image/")],
        code: 220,
        path: "",
        files: [file.name]
      },
      file: finalUrl,
      url: finalUrl,
    });
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
