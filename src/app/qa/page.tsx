import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export default async function QaPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
  });

  async function submitQuestion(formData: FormData) {
    "use server";
    const askerName = formData.get("askerName") as string;
    const question = formData.get("question") as string;
    if (askerName && question) {
      await prisma.question.create({ data: { askerName, question } });
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
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi của bạn *</label>
              <input
                name="question"
                required
                type="text"
                placeholder="Điểm chuẩn ngành Y khoa năm nay là bao nhiêu?"
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

      {/* Q&A List */}
      <div className="space-y-5">
        <h3 className="text-lg font-bold text-blue-800">{questions.length} câu hỏi</h3>

        {questions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-blue-100 p-12 text-center text-gray-400">
            <div className="text-4xl mb-3">🤔</div>
            <p>Hãy là người đầu tiên đặt câu hỏi!</p>
          </div>
        ) : (
          questions.map((q) => (
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
                    <p className="text-xs font-semibold text-blue-700 mb-1">Chuyên gia tư vấn</p>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">{q.answer}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-orange-50 border-t border-orange-100 px-5 py-3">
                  <span className="text-orange-600 text-xs font-medium">⏳ Đang chờ chuyên gia trả lời...</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
