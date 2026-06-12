import { getDriveFiles } from "./actions";
import FileManagerClient from "./FileManagerClient";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Quản lý tệp tin | Admin Panel",
};

export default async function FilesPage() {
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

  const { success, files, message } = await getDriveFiles();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tệp tin (Google Drive)</h1>
        <p className="text-slate-500 mt-1">
          Xem và quản lý các tệp đã tải lên hệ thống. Việc xóa tệp tại đây sẽ chuyển tệp vào Thùng rác (Trash) trên Google Drive.
        </p>
      </div>

      {!success ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-100">
          <p className="font-bold">Lỗi kết nối Google Drive:</p>
          <p>{message}</p>
        </div>
      ) : (
        <FileManagerClient initialFiles={files as any[]} />
      )}
    </div>
  );
}
