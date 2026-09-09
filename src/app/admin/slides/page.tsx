import { getSlidesAction } from "./actions";
import SlideManagerClient from "./SlideManagerClient";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Quản lý Slide | Admin Panel",
};

export default async function SlidesPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;

  if (!auth) {
    redirect("/login");
  }

  // Ensure only ADMIN can access this page
  if (auth !== "admin_logged_in") {
    const user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (!user || user.role !== "ADMIN") {
      redirect("/admin");
    }
  }

  const slides = await getSlidesAction();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý Slide Trang chủ</h1>
        <p className="text-slate-500 mt-1">
          Cập nhật các ảnh slide hiển thị ở trang chủ. Kéo thả để thay đổi thứ tự.
        </p>
      </div>

      <SlideManagerClient initialSlides={slides} />
    </div>
  );
}
