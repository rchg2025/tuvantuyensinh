"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function updateConsultationStatus(id: string, newStatus: string, note?: string) {
  const cookieStore = await cookies();
  const authNameEncoded = cookieStore.get("auth_name")?.value;
  const userName = authNameEncoded ? decodeURIComponent(authNameEncoded) : "Admin";

  const request = await prisma.consultationRequest.findUnique({ where: { id } });
  if (!request) return;

  // Use any to bypass TS error if Prisma client has not been regenerated yet
  const currentStatus = (request as any).status || "Cần tư vấn";
  if (currentStatus === newStatus && !note) return; // No change

  const hist = (request as any).history;
  const currentHistory = hist ? JSON.parse(hist) : [];
  
  const newEntry = {
    status: newStatus,
    note: note || "",
    updatedBy: userName,
    updatedAt: new Date().toISOString()
  };

  const isProcessed = newStatus === "Đã tư vấn";

  await prisma.consultationRequest.update({
    where: { id },
    data: {
      status: newStatus,
      isProcessed,
      history: JSON.stringify([...currentHistory, newEntry]),
    } as any
  });

  revalidatePath("/admin/consultations");
}

export async function deleteConsultationRequest(id: string) {
  await prisma.consultationRequest.delete({ where: { id } });
  revalidatePath("/admin/consultations");
}
