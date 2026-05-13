import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, questionCount, answeredCount] = await Promise.all([
    prisma.post.count(),
    prisma.question.count(),
    prisma.question.count({ where: { answer: { not: null } } }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Tổng bài viết</p>
            <h2 className="text-3xl font-black text-blue-600">{postCount}</h2>
          </div>
          <div className="text-4xl">📰</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Tổng câu hỏi</p>
            <h2 className="text-3xl font-black text-indigo-600">{questionCount}</h2>
          </div>
          <div className="text-4xl">💬</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Câu hỏi đã phản hồi</p>
            <h2 className="text-3xl font-black text-emerald-600">{answeredCount}</h2>
          </div>
          <div className="text-4xl">✅</div>
        </div>
      </div>
    </div>
  );
}
