import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function Home() {
  const [postCount, questionCount, latestQuestions] = await Promise.all([
    prisma.post.count(),
    prisma.question.count(),
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-700 via-blue-600 to-sky-500 text-white rounded-[2.5rem] overflow-hidden shadow-2xl px-6 md:px-12 py-24 text-center mt-6">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md text-white text-sm font-semibold px-5 py-2 rounded-full mb-2">
            <span className="text-yellow-300">🎓</span> Hệ thống tư vấn tuyển sinh trực tuyến
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight">
            Định hướng tương lai — <br className="hidden md:block" />
            <span className="text-yellow-300">Chọn đúng ngành, sáng tương lai</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto font-medium">
            Đội ngũ chuyên gia giàu kinh nghiệm luôn sẵn sàng đồng hành và hỗ trợ bạn trên con đường chinh phục cánh cửa đại học.
          </p>
          
          {/* Smart Search Bar */}
          <div className="max-w-2xl mx-auto mt-10">
            <form action="/qa" method="GET" className="relative flex items-center shadow-2xl rounded-full bg-white p-2">
              <span className="absolute left-6 text-2xl">🔍</span>
              <input 
                type="text" 
                name="q"
                placeholder="Tìm kiếm thông tin tuyển sinh, câu hỏi..." 
                className="w-full text-gray-900 bg-transparent py-4 pl-14 pr-36 focus:outline-none text-base md:text-lg rounded-full"
              />
              <button type="submit" className="absolute right-2 bg-blue-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full font-bold transition-all text-sm md:text-base">
                Tìm kiếm
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link href="/consultation" className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-4 px-10 rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95">
              Đăng ký tư vấn ngay
            </Link>
            <Link href="/qa" className="bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm text-white font-semibold py-4 px-10 rounded-2xl transition-all">
              Đặt câu hỏi Q&A
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4 md:px-0">
        {[
          { label: "Bài viết chia sẻ", value: postCount.toString(), icon: "📰", color: "text-blue-600" },
          { label: "Câu hỏi Q&A", value: questionCount.toString(), icon: "💬", color: "text-indigo-600" },
          { label: "Trường Đại học", value: "50+", icon: "🏫", color: "text-sky-600" },
          { label: "Hỗ trợ trực tuyến", value: "24/7", icon: "🕒", color: "text-yellow-500" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 text-center hover:-translate-y-2 hover:shadow-xl transition-all duration-300">
            <div className="text-4xl mb-4">{stat.icon}</div>
            <div className={`div className={`text-4xl font-black ${stat.color} mb-2`}`}>{stat.value}</div>
            <div className="text-slate-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Main Features */}
      <section className="px-4 md:px-0">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-4">Khám phá các chuyên mục</h2>
          <p className="text-slate-600">Những công cụ và thông tin cần thiết giúp bạn trang bị hành trang bước vào giảng đường.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Tin tức & Sự kiện",
              desc: "Cập nhật nhanh nhất thông tin về kỳ thi, điểm chuẩn và hướng dẫn quy chế tuyển sinh.",
              link: "/posts",
              icon: "📚",
              action: "Đọc tin tức"
            },
            {
              title: "Hỏi & Đáp (Q&A)",
              desc: "Nơi cộng đồng và các chuyên gia giải đáp mọi thắc mắc của bạn một cách nhanh chóng.",
              link: "/qa",
              icon: "💡",
              action: "Xem câu hỏi"
            },
            {
              title: "Đăng ký Tư vấn",
              desc: "Để lại thông tin cá nhân, đội ngũ tư vấn viên sẽ trực tiếp liên hệ và hỗ trợ bạn.",
              link: "/consultation",
              icon: "🤝",
              action: "Đăng ký ngay"
            }
          ].map((feature, idx) => (
             <Link key={idx} href={feature.link} className="group block bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
                <div className="p-8">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-600 mb-6 line-clamp-3">{feature.desc}</p>
                  <div className="font-semibold text-blue-600 group-hover:text-blue-700 flex items-center gap-2">
                    {feature.action} <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
             </Link>
          ))}
        </div>
      </section>

      {/* Latest Q&A */}
      <section className="bg-slate-50 rounded-[2.5rem] p-8 md:p-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 text-center md:text-left gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900">Câu hỏi tư vấn mới nhất</h2>
            <p className="text-slate-600 mt-2">Những thắc mắc thường gặp từ các bạn học sinh.</p>
          </div>
          <Link href="/qa" className="bg-white text-blue-600 hover:text-blue-700 font-bold py-3 px-6 rounded-xl shadow-sm border border-slate-200 hover:border-blue-200 transition-all whitespace-nowrap">
            Xem tất cả câu hỏi →
          </Link>
        </div>

        <div className="grid gap-4">
          {latestQuestions.length > 0 ? (
            latestQuestions.map((q) => (
              <Link key={q.id} href={`/qa`} className="group bg-white hover:bg-blue-50/50 rounded-2xl p-6 border border-slate-100 hover:border-blue-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-5">
                  <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex-shrink-0 text-xl font-bold">
                    Q
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{q.question}</h3>
                    <p className="text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">{q.answer || 'Đang chờ chuyên gia phản hồi...'}</p>
                    <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1">👤 {q.askerName}</span>
                      <span className="flex items-center gap-1">📅 {new Date(q.createdAt).toLocaleDateString("vi-VN")}</span>
                      {q.answer ? (
                        <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-[10px] uppercase">Đã trả lời</span>
                      ) : (
                        <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full text-[10px] uppercase">Chờ duyệt</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
             <div className="text-center py-16 text-slate-500 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                Chưa có câu hỏi nào trong hệ thống.
             </div>
          )}
        </div>
      </section>

      {/* Call to Action CTA */}
      <section className="bg-indigo-900 rounded-[2.5rem] p-10 md:p-16 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-blue-600 blur-3xl opacity-50"></div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Bạn còn phân vân về định hướng nghề nghiệp?</h2>
          <p className="text-indigo-200 lg:w-2/3 mx-auto mb-10 text-lg">Đừng ngần ngại để lại thông tin. Đội ngũ tư vấn ưu tú của chúng tôi sẽ liên hệ và giải đáp chi tiết mọi thắc mắc của bạn để đưa ra những lựa chọn đúng đắn nhất.</p>
          <Link href="/consultation" className="inline-block bg-white text-indigo-900 hover:bg-slate-100 font-bold py-4 px-10 rounded-2xl shadow-2xl transition-transform hover:scale-105">
            Nhận tư vấn trực tiếp ngay hôm nay
          </Link>
        </div>
      </section>
    </div>
  );
}
