import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const code = searchParams.get("code");
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || new URL(req.url).host;
  const proto = req.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const origin = `${proto}://${host}`;
  const redirectUri = `${origin}/api/auth/google/callback`;

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", origin));
  }

  const dbConfigs = await prisma.systemConfig.findMany({
    where: { key: { in: ["google_client_id", "google_client_secret"] } }
  });
  
  const clientId = dbConfigs.find(c => c.key === "google_client_id")?.value;
  const clientSecret = dbConfigs.find(c => c.key === "google_client_secret")?.value;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL("/login?error=google_config_missing", origin));
  }

  try {
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
    
    const tokenData = await tokenRes.json();
    if (tokenData.error) {
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", origin));
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();
    
    if (!userData || !userData.email) {
      return NextResponse.redirect(new URL("/login?error=google_auth_failed", origin));
    }
    
    const email = userData.email;

    const dbUser = await prisma.systemUser.findUnique({ where: { email } });
    
    let matched = false;
    let currentName = "Admin";
    let currentId = "admin_logged_in";
    let currentAvatar = userData.picture || "";

    if (email === "nguyenluyen@nsg.edu.vn") {
       matched = true;
       currentName = "Nguyễn Văn Luyến";
    } else if (dbUser) {
       matched = true;
       currentName = dbUser.name || dbUser.email;
       currentId = dbUser.id;
       currentAvatar = dbUser.avatar || userData.picture || "";
    }

    if (matched) {
      const cookieStore = await cookies();
      cookieStore.set("auth_token", currentId, {
        httpOnly: true,
        path: "/",
      });
      cookieStore.set("auth_name", encodeURIComponent(currentName), {
        httpOnly: true,
        path: "/",
      });
      if (currentAvatar) {
        cookieStore.set("auth_avatar", encodeURIComponent(currentAvatar), {
          httpOnly: true,
          path: "/",
        });
      } else {
        cookieStore.delete("auth_avatar");
      }
      return NextResponse.redirect(new URL("/admin", origin));
    } else {
      return NextResponse.redirect(new URL("/login?error=google_unlinked", origin));
    }
  } catch (error) {
    return NextResponse.redirect(new URL("/login?error=google_auth_failed", origin));
  }
}
