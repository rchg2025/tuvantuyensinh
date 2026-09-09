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

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || new URL(req.url).host;
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;
  
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=email profile`;
  
  return NextResponse.redirect(authUrl);
}
