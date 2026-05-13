import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
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