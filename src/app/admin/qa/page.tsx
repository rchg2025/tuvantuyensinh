import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { cookies } from "next/headers";
import LiveSearch from "@/components/LiveSearch";
import QaRow from "./QaRow";
import SourceSelect from "./SourceSelect";
import { notifyStudentQuestionAnswered } from "@/lib/mail";

import Pagination from "@/components/Pagination";

export const dynamic = "force-dynamic";

export default async function AdminQaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const status = typeof resolvedSearchParams.status === "string" ? resolvedSearchParams.status : "all";
  const source = typeof resolvedSearchParams.source === "string" ? resolvedSearchParams.source : "all";
  const tab = typeof resolvedSearchParams.tab === "string" ? resolvedSearchParams.tab : "manage";
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1;
  const pageSize = 10;

  const searchFilter = q
    ? {
        OR: [
          { question: { contains: q, mode: "insensitive" as const } },
          { answer: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const statusFilter =
    status === "answered"
      ? { NOT: [{ answer: null }, { answer: "" }] }
      : status === "unanswered"
      ? { OR: [{ answer: null }, { answer: "" }] } 
      : {};

  const sourceFilter =
    source === "student" ? { isFromSchool: false }
    : source === "admin" ? { isFromSchool: true }
    : {};

  const queryWhere = {
    AND: [
      searchFilter,
      statusFilter,
      sourceFilter,
    ]
  };

  const [totalQuestions, questions] = await Promise.all([
    prisma.question.count({ where: queryWhere }),
    prisma.question.findMany({
      where: queryWhere,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true },
    }),
  ]);

  const totalPages = Math.ceil(totalQuestions / pageSize);

  async function updateQuestionInfo(id: string, data: { answer?: string, question?: string }) {
    "use server";
    
    // We update the fields
    const cookieStore = await cookies();
    const authNameEncoded = cookieStore.get("auth_name")?.value;
    const currentUserName = authNameEncoded ? decodeURIComponent(authNameEncoded) : "Admin";

    const updateData: any = {};
    if (data.answer !== undefined) {
      updateData.answer = data.answer.trim() === "" ? null : data.answer;
      if (updateData.answer !== null) {
        updateData.answeredBy = currentUserName;
        updateData.answeredAt = new Date();
      }
    }
    if (data.question !== undefined) {
      updateData.question = data.question;
    }

    const q = await prisma.question.update({
      where: { id },
      data: updateData,
    });

    if (data.answer !== undefined && q.email && q.answer) {
      notifyStudentQuestionAnswered(q.email, {
        askerName: q.askerName,
        question: q.question,
        answer: q.answer
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
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hỏi - Đáp</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý câu hỏi và tư vấn</p>
        </div>
      </div>

      <div className="flex border-b border-slate-200">
        <Link
          href={`/admin/qa?tab=manage&status=${status}${q ? `&q=${q}` : ""}`}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "manage"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Quản lý Hỏi - Đáp
        </Link>
        <Link
          href={`/admin/qa?tab=create`}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            tab === "create"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
          }`}
        >
          Tạo mới câu hỏi Q&A
        </Link>
      </div>

      {tab === "create" ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Tạo Q&A nội bộ</h2>
          <form action={createQuestion} className="space-y-4 w-full">
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
                rows={4}
                placeholder="Đội ngũ trả lời sẵn nội dung luôn..."
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2 rounded-lg transition-colors">
              Đăng câu hỏi
            </button>
          </form>
        </div>
      ) : (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2">
              <Link
                href={`/admin/qa?tab=manage&status=all&source=${source}${q ? `&q=${q}` : ""}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === "all" ? "bg-slate-800 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}
              >
                Tất cả
              </Link>
              <Link
                href={`/admin/qa?tab=manage&status=unanswered&source=${source}${q ? `&q=${q}` : ""}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === "unanswered" ? "bg-orange-500 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}
              >
                Chưa trả lời
              </Link>
              <Link
                href={`/admin/qa?tab=manage&status=answered&source=${source}${q ? `&q=${q}` : ""}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${status === "answered" ? "bg-green-600 text-white" : "bg-white border text-slate-600 hover:bg-slate-50"}`}
              >
                Đã trả lời
              </Link>
            </div>
            <form action="/admin/qa" method="GET" className="relative flex items-center w-full flex-wrap sm:flex-nowrap sm:w-auto gap-2 mt-4 sm:mt-0">
              <input type="hidden" name="tab" value="manage" />
              <input type="hidden" name="status" value={status} />
              <SourceSelect defaultValue={source} />
              <div className="relative w-full sm:w-auto">
                <LiveSearch 
                  additionalParams={{ tab, status }}
                  className="w-full sm:w-64 text-gray-900 bg-white border border-slate-200 rounded-lg py-2.5 pl-9 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm shadow-sm" 
                />
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[800px]">
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
                    onUpdate={updateQuestionInfo}
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
            </table></div>
            
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50">
                <Pagination currentPage={page} totalPages={totalPages} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
