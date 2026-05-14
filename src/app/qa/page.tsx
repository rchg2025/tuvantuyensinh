import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import LiveSearch from "@/components/LiveSearch";
import { notifyNewQuestion } from "@/lib/mail";

export const dynamic = "force-dynamic";

export default async function QaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const tab = typeof resolvedSearchParams.tab === "string" ? resolvedSearchParams.tab : "all";
  const q = typeof resolvedSearchParams.q === "string" ? resolvedSearchParams.q : "";
  const page = typeof resolvedSearchParams.page === "string" ? parseInt(resolvedSearchParams.page) : 1;
  const pageSize = 10;

  const categories = await prisma.category.findMany({
    where: { type: "MAJOR" },
  });

  const queryWhere = {
    ...(tab !== "all" ? { isFromSchool: tab === "school" } : {}),
    ...(q ? {
      OR: [
        { question: { contains: q, mode: "insensitive" as const } },
        { answer: { contains: q, mode: "insensitive" as const } },
      ],
    } : {}),
  };

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

  async function submitQuestion(formData: FormData) {
    "use server";
    const askerName = formData.get("askerName") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const categoryId = formData.get("categoryId") as string;
    const question = formData.get("question") as string;
    
    if (askerName && question) {
      const q = await prisma.question.create({
        data: {
          askerName,
          phone: phone || null,
          email: email || null,
          categoryId: categoryId || null,
          question,
          isFromSchool: false,
        },
        include: { category: true }
      });
      // Gửi mail thông báo
      notifyNewQuestion({ qId: q.id, askerName, question, categoryName: q.category?.name }).catch(console.error);

      revalidatePath("/qa");
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl px-8 py-10 shadow-md">
        <h2 className="text-3xl font-extrabold mb-2">💬 Hỏi Đáp (Q&A)</h2>
        <p className="text-blue-100">Đặt câu hỏi và nhận giải đáp từ chuyên gia tư vấn tuyển sinh.</p>
      </div>

      {/* Ask form */}
      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-7">
        <h3 className="text-lg font-bold text-blue-800 mb-5">✍️ Gửi câu hỏi của bạn</h3>
        <form action={submitQuestion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
              <input
                name="askerName"
                required
                type="text"
                placeholder="Nguyễn Văn A"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                name="phone"
                type="tel"
                placeholder="0909..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                name="email"
                required
                type="email"
                placeholder="email@gmail.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngành nghề quan tâm</label>
              <select
                title="Ngành nghề quan tâm"
                name="categoryId"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition bg-white"
              >
                <option value="">-- Chọn ngành nghề --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi của bạn *</label>
              <input
                name="question"
                required
                type="text"
                placeholder="Học phí ngành Công nghệ kỹ thuật cơ khí năm nay là bao nhiêu?"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-xl shadow transition-colors"
          >
            Gửi câu hỏi
          </button>
        </form>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-blue-50">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/qa?tab=all${q ? `&q=${q}` : ""}`}
            className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
              tab === "all" ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            Tất cả
          </Link>
          <Link
            href={`/qa?tab=student${q ? `&q=${q}` : ""}`}
            className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
              tab === "student" ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            Q&A của Học viên
          </Link>
          <Link
            href={`/qa?tab=school${q ? `&q=${q}` : ""}`}
            className={`px-4 sm:px-6 py-2 rounded-lg font-medium text-sm transition-colors ${
              tab === "school" ? "bg-blue-600 text-white shadow-sm" : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            Q&A từ nhà trường
          </Link>
        </div>
        
        <form action="/qa" method="GET" className="relative flex items-center w-full md:w-auto">
          <LiveSearch additionalParams={{ tab }} />
        </form>
      </div>

      {/* Q&A List */}
      <div className="space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-blue-800">{totalQuestions} câu hỏi</h3>
        </div>

        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🤔</div>
            <p>{q ? "Không tìm thấy câu hỏi nào phù hợp" : "Chưa có câu hỏi nào!"}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <div key={q.id} className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
                {/* Question */}
                <div className="p-5 flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                    {q.askerName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-sm">{q.askerName}</span>
                      <span className="text-gray-400 text-xs">·</span>
                      <span className="text-gray-400 text-xs">
                        {q.createdAt.toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-gray-800">{q.question}</p>
                  </div>
                </div>

                {/* Answer */}
                {q.answer ? (
                  <div className="bg-blue-50 border-t border-blue-100 px-5 py-4 flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold">
                      TV
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-blue-700 mb-1">Chuyên viên tư vấn</p>
                      <p className="text-gray-700 text-sm whitespace-pre-wrap">{q.answer}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-orange-50 border-t border-orange-100 px-5 py-3">
                    <span className="text-orange-600 text-xs font-medium">⏳ Đang chờ chuyên viên tư vấn trả lời...</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              return (
                <Link
                  key={p}
                  href={`/qa?tab=${tab}&page=${p}${q ? `&q=${q}` : ""}`}
                  className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium text-sm transition-colors ${
                    page === p
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
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
