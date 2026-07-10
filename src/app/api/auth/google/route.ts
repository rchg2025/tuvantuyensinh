import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const dbConfigs = await prisma.systemConfig.findMany({
    where: { key: { in: ["google_client_id"] } }
  });
  
  const clientId = dbConfigs.find(c => c.key === "google_client_id")?.value;
  
  if (!clientId) {
    return NextResponse.redirect(new URL("/login?error=google_config_missing", req.url));
  }

  const origin = new URL(req.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email profile`;
  
  return NextResponse.redirect(authUrl);
}
