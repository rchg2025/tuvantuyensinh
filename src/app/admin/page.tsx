import prisma from "@/lib/prisma";
import Link from "next/link";
import { DashboardCharts } from "./components/DashboardCharts";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [postCount, questionCount, answeredCount, consultationCount, pendingConsultationCount, recentConsultations, topPosts] = await Promise.all([
    prisma.post.count(),
    prisma.question.count(),
    prisma.question.count({ where: { answer: { not: null } } }),
    prisma.consultationRequest.count(),
    prisma.consultationRequest.count({ where: { status: { not: "Đã tư vấn" } } }),
    prisma.consultationRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.post.findMany({
      orderBy: { viewCount: "desc" },
      take: 5,
      select: { id: true, title: true, slug: true, viewCount: true, createdAt: true, category: { select: { name: true } } }
    })
  ]);

  // For charts
  const rawConsultations = await prisma.consultationRequest.groupBy({
    by: ['program'],
    _count: {
      _all: true
    }
  });

  const consultationsByProgram = rawConsultations.map(c => ({
    name: c.program || "Chưa xác định",
    value: c._count._all
  }));

  const qaStatus = [
    { name: "Đã phản hồi", value: answeredCount },
    { name: "Chờ xử lý", value: questionCount - answeredCount }
  ];

  const statusColors: Record<string, string> = {
    "Cần tư vấn": "text-red-700 bg-red-100",
    "Đang tư vấn": "text-blue-700 bg-blue-100",
    "Tư vấn chuyên sâu": "text-amber-700 bg-amber-100",
    "Đã tư vấn": "text-emerald-700 bg-emerald-100",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">Bảng điều khiển</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/posts" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Tổng bài viết</p>
            <h2 className="text-3xl font-black text-blue-600">{postCount}</h2>
          </div>
          <div className="text-4xl opacity-80">🔰</div>
        </Link>

        <Link href="/admin/qa" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between hover:shadow-md transition-shadow">
          <div>
            <p className="text-sm font-semibold text-slate-500 mb-1">Tổng câu hỏi</p>
            <h2 className="text-3xl font-black text-indigo-600">{questionCount}</h2>
          </div>
          <div className="text-4xl opacity-80">💌</div>
        </Link>

        <Link href="/admin/qa?tab=manage&status=unanswered&source=all" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Câu hỏi chờ duyệt</p>
            <h2 className="text-3xl font-black text-red-500">{questionCount - answeredCount}</h2>
          </div>
          <div className="text-4xl opacity-80 relative z-10">⏳</div>
          {(questionCount - answeredCount) > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>}
        </Link>

        <Link href="/admin/consultations" className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between relative overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative z-10">
            <p className="text-sm font-semibold text-slate-500 mb-1">Đăng ký mới / Chờ xử lý</p>
            <h2 className="text-3xl font-black text-orange-500">{pendingConsultationCount}</h2>
          </div>
          <div className="text-4xl opacity-80 relative z-10">📞</div>
          {pendingConsultationCount > 0 && <div className="absolute top-0 right-0 w-16 h-16 bg-orange-100 rounded-bl-full -mr-4 -mt-4 opacity-50"></div>}
        </Link>
      </div>

      <DashboardCharts consultationsByProgram={consultationsByProgram} qaStatus={qaStatus} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Đăng ký tư vấn gần đây</h3>
            <Link href="/admin/consultations" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Xem tất cả &rarr;</Link>
          </div>
          <div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
              <tr>
                <th className="p-4">Tên</th>
                <th className="p-4">SĐT</th>
                <th className="p-4">Thời gian</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {recentConsultations.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-top font-bold text-slate-800">{c.name}</td>
                  <td className="p-4 align-middle text-slate-600">{c.phone}</td>
                  <td className="p-4 align-middle text-slate-500">{new Date(c.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
                  <td className="p-4 align-middle">
                    <span className={`${statusColors[c.status || "Cần tư vấn"] || statusColors["Cần tư vấn"]} font-semibold px-2 py-1 rounded text-xs block w-max`}>
                      {c.status || "Cần tư vấn"}
                    </span>
                  </td>
                </tr>
              ))}
              {recentConsultations.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Chưa có đăng ký nào.</td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <h3 className="text-lg font-bold text-slate-800">Top bài viết xem nhiều nhất</h3>
            <Link href="/admin/posts" className="text-sm text-blue-600 hover:text-blue-800 font-semibold">Xem tất cả &rarr;</Link>
          </div>
          <div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[600px]">
            <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
              <tr>
                <th className="p-4">Tiêu đề</th>
                <th className="p-4 text-center">Lượt xem</th>
                <th className="p-4">Ngày đăng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {topPosts.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-middle font-bold text-slate-800 max-w-xs truncate">
                    <Link href={`/posts/${p.slug || p.id}`} target="_blank" className="hover:text-blue-600 transition-colors" title={p.title}>{p.title}</Link>
                  </td>
                  <td className="p-4 align-middle text-center text-slate-500 font-semibold">{p.viewCount || 0}</td>
                  <td className="p-4 align-middle text-slate-500">{new Date(p.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</td>
                </tr>
              ))}
              {topPosts.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500">Chưa có bài viết nào.</td>
                </tr>
              )}
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  );
}