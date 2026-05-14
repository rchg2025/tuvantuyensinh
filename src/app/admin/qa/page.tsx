import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { cookies } from "next/headers";
import LiveSearch from "@/components/LiveSearch";
import QaRow from "./QaRow";
import { notifyStudentQuestionAnswered } from "@/lib/mail";

export const dynamic = "force-dynamic";

export default async function AdminQaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1;
  const pageSize = 10;

  const queryWhere = q
    ? {
        OR: [
          { question: { contains: q, mode: "insensitive" as const } },
          { answer: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [totalQuestions, questions] = await Promise.all([
    prisma.question.count({ where: queryWhere }),
    prisma.question.findMany({
      where: queryWhere,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  const totalPages = Math.ceil(totalQuestions / pageSize);

  async function updateAnswerWrapper(id: string, answer: string) {
    "use server";
    const q = await prisma.question.update({
      where: { id },
      data: { answer },
    });

    if (q.email && answer.trim()) {
      notifyStudentQuestionAnswered(q.email, {
        askerName: q.askerName,
        question: q.question,
        answer
      }).catch(console.error);
    }

    revalidatePath("/admin/qa");
  }

  async function deleteQuestionWrapper(id: string) {
    "use server";
    await prisma.question.delete({ where: { id } });
    revalidatePath("/admin/qa");
  }

  async function createQuestion(formData: FormData) {
    "use server";
    const question = formData.get("question")?.toString();
    const answer = formData.get("answer")?.toString();
    
    if (question && answer) {
      const cookieStore = await cookies();
      const authNameEncoded = cookieStore.get("auth_name")?.value;
      const currentUserName = authNameEncoded ? decodeURIComponent(authNameEncoded) : "Admin";

      await prisma.question.create({
        data: {
          askerName: currentUserName,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-800">Quản lý câu hỏi & Tư vấn</h1>
        <form action="/admin/qa" method="GET" className="relative flex items-center w-full sm:w-auto">
          <LiveSearch className="w-full sm:w-64 text-gray-900 bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-sm" />
        </form>
      </div>

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
              <QaRow
                key={q.id}
                question={q}
                onUpdate={updateAnswerWrapper}
                onDelete={deleteQuestionWrapper}
              />
            ))}
            {questions.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  {q ? "Không tìm thấy câu hỏi nào phù hợp." : "Chưa có câu hỏi nào."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex justify-center gap-2 bg-slate-50">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <Link
                  key={p}
                  href={`/admin/qa?page=${p}${q ? `&q=${q}` : ""}`}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {p}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}