import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminConsultationsPage() {
  const requests = await prisma.consultationRequest.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function markAsProcessed(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) {
      await prisma.consultationRequest.update({
        where: { id },
        data: { isProcessed: true },
      });
      revalidatePath("/admin/consultations");
    }
  }

  async function deleteRequest(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) {
      await prisma.consultationRequest.delete({ where: { id } });
      revalidatePath("/admin/consultations");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Thông tin liên hệ & Tư vấn</h1>
      <p className="text-slate-500 mb-6">Danh sách học viên để lại thông tin cần tư vấn hoặc gọi điện lại.</p>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
            <tr>
              <th className="p-4">Thông tin HV</th>
              <th className="p-4">Ngành quan tâm</th>
              <th className="p-4">Ghi chú</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {requests.map((r) => (
              <tr key={r.id} className={`hover:bg-slate-50 transition-colors ${r.isProcessed ? "opacity-60" : ""}`}>
                <td className="p-4">
                  <p className="font-bold text-slate-800">{r.name}</p>
                  <p className="text-blue-600 font-medium">📞 {r.phone}</p>
                  {r.email && <p className="text-slate-500 text-xs mt-1">📧 {r.email}</p>}
                </td>
                <td className="p-4 font-semibold text-slate-700">{r.program || "Chưa xác định"}</td>
                <td className="p-4 text-slate-600 max-w-xs truncate">{r.notes}</td>
                <td className="p-4 text-center">
                  {r.isProcessed ? (
                    <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold uppercase">Đã tư vấn</span>
                  ) : (
                    <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-xs font-bold uppercase">Cần gọi lại</span>
                  )}
                </td>
                <td className="p-4 text-center space-y-2">
                  {!r.isProcessed && (
                    <form action={markAsProcessed}>
                      <input type="hidden" name="id" value={r.id} />
                      <button type="submit" className="text-blue-600 hover:text-blue-800 font-bold px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 transition text-xs w-full">Đã xử lý</button>
                    </form>
                  )}
                  <form action={deleteRequest}>
                    <input type="hidden" name="id" value={r.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition text-xs w-full">Xóa</button>
                  </form>
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Chưa có ai đăng ký cần tư vấn.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}