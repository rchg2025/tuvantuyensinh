import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

export default async function AdminQaPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function updateAnswer(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    const answer = formData.get("answer")?.toString() || null;
    
    if (id) {
      await prisma.question.update({
        where: { id },
        data: { answer },
      });
      revalidatePath("/admin/qa");
    }
  }

  async function deleteQuestion(formData: FormData) {
    "use server";
    const id = formData.get("id")?.toString();
    if (id) {
      await prisma.question.delete({ where: { id } });
      revalidatePath("/admin/qa");
    }
  }

  async function createQuestion(formData: FormData) {
    "use server";
    const question = formData.get("question")?.toString();
    const answer = formData.get("answer")?.toString();
    
    if (question && answer) {
      await prisma.question.create({
        data: {
          askerName: "Admin/Chuyên gia",
          question,
          answer,
          isFromSchool: true,
        },
      });
      revalidatePath("/admin/qa");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Quản lý câu hỏi & Tư vấn</h1>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Tạo Q&A nội bộ</h2>
        <form action={createQuestion} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Câu hỏi (Tự nhập)</label>
            <input 
              name="question" 
              required 
              placeholder="VD: Điều kiện xét tuyển học bạ là gì?"
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Câu trả lời</label>
            <textarea 
              name="answer" 
              required 
              rows={3}
              placeholder="Đội ngũ trả lời sẵn nội dung luôn..."
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            Tạo mới
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
            <tr>
              <th className="p-4">Người hỏi</th>
              <th className="p-4 w-1/3">Câu hỏi</th>
              <th className="p-4 w-1/3">Câu trả lời</th>
              <th className="p-4 text-center">Xóa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="p-4 align-top font-medium text-slate-800">{q.askerName}</td>
                <td className="p-4 align-top text-slate-600">
                  <p className="line-clamp-3">{q.question}</p>
                  <p className="text-xs text-slate-400 mt-2">{new Date(q.createdAt).toLocaleDateString("vi-VN")}</p>
                </td>
                <td className="p-4 align-top">
                  <form action={updateAnswer} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={q.id} />
                    <textarea 
                      name="answer"
                      defaultValue={q.answer || ""}
                      placeholder="Nhập câu trả lời..."
                      className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 min-h-[80px]"
                    />
                    <button type="submit" className="self-end px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs transition-colors">
                      {q.answer ? "Cập nhật" : "Trả lời"}
                    </button>
                  </form>
                </td>
                <td className="p-4 align-top text-center justify-center">
                  <form action={deleteQuestion}>
                    <input type="hidden" name="id" value={q.id} />
                    <button type="submit" className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs mt-2">
                      Xóa
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">Chưa có câu hỏi nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}