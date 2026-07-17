import { getDriveFiles } from "./actions";
import FileManagerClient from "./FileManagerClient";
import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

import Link from "next/link";

export const metadata = {
  title: "Quản lý tệp tin | Admin Panel",
};

export default async function FilesPage(props: { searchParams: Promise<{ folderId?: string }> }) {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  const searchParams = await props.searchParams;
  const currentFolderId = searchParams?.folderId;

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

  const { success, files, message } = await getDriveFiles(currentFolderId);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý tệp tin (Google Drive)</h1>
        <p className="text-slate-500 mt-1">
          Xem và quản lý các tệp đã tải lên hệ thống. Việc xóa tệp tại đây sẽ chuyển tệp vào Thùng rác (Trash) trên Google Drive.
        </p>
        {currentFolderId && (
          <div className="mt-4">
            <Link href="/admin/files" className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Quay lại thư mục gốc
            </Link>
          </div>
        )}
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
