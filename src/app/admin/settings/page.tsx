import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const cookieStore = await cookies();
  const auth = cookieStore.get("auth_token")?.value;
  if (auth && auth !== "admin_logged_in") {
    const user = await prisma.systemUser.findUnique({ where: { id: auth } });
    if (user && user.role !== "ADMIN") redirect("/admin");
  }

  const configs = await prisma.systemConfig.findMany();
  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, string>);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-800">⚙️ Cấu hình hệ thống</h1>
      <SettingsForm configMap={configMap} />
    </div>
  );
}