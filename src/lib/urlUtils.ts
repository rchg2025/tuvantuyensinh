import { headers } from "next/headers";

/**
 * Tự động nhận diện Base URL của website dựa theo domain mà người dùng hoặc bot đang truy cập.
 * Hỗ trợ tự động nhận diện cả ts26.nsg.edu.vn, cokhi.namsaigon.edu.vn hoặc bất kỳ domain nào trỏ về.
 */
export async function getRequestBaseUrl(): Promise<string> {
  try {
    const headersList = await headers();
    const host = headersList.get("x-forwarded-host") || headersList.get("host");
    if (host) {
      const proto = headersList.get("x-forwarded-proto") || "https";
      return `${proto}://${host}`;
    }
  } catch {
    // Chạy ngoài request context (ví dụ static generation lúc build)
  }
  return process.env.NEXT_PUBLIC_SITE_URL || "https://cokhi.namsaigon.edu.vn";
}
