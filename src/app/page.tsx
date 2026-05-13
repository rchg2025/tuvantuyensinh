import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function Home() {
  const [postCount, questionCount] = await Promise.all([
    prisma.post.count(),
    prisma.question.count(),
  ]);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white rounded-3xl overflow-hidden shadow-2xl px-8 py-20 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-block bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-2">
            🎓 Hệ thống tư vấn tuyển sinh trực tuyến
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Định hướng tương lai — <br />
            <span className="text-yellow-300">Chọn đúng ngành, đúng trường</span>
          </h1>
          <p className="text-blue-100 text-lg max-w-xl mx-auto">
            Cung cấp thông tin tuyển sinh chính xác, kịp thời. Đội ngũ chuyên gia luôn sẵn sàng hỗ trợ bạn trong hành trình chọn ngành học phù hợp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link href="/consultation" className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105">
              Đăng ký tư vấn miễn phí →
            </Link>
            <Link href="/qa" className="bg-white/15 hover:bg-white/25 border border-white/40 text-white font-semibold py-3 px-8 rounded-xl transition-all">
              Xem Hỏi & Đáp
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Bài viết", value: postCount.toString(), icon: "📰" },
          { label: "Câu hỏi Q&A", value: questionCount.toString(), icon: "💬" },
          { label: "Chương trình", value: "4+", icon: "🎯" },
          { label: "Hỗ trợ", value: "24/7", icon: "🕐" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6 text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-extrabold text-blue-700">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Services */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-blue-800 text-center">Dịch vụ của chúng tôi</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "📝",
              title: "Tin tức & Bài viết",
              desc: "Cập nhật các thông tin tuyển sinh, thông báo quan trọng từ các trường đại học trong và ngoài nước.",
              href: "/posts",
              cta: "Xem bài viết",
            },
            {
              icon: "❓",
              title: "Hỏi đáp Q&A",
              desc: "Đặt câu hỏi và nhận câu trả lời từ đội ngũ chuyên gia tư vấn tuyển sinh giàu kinh nghiệm.",
              href: "/qa",
              cta: "Đặt câu hỏi",
            },
            {
              icon: "📞",
              title: "Đăng ký tư vấn",
              desc: "Gửi thông tin để được tư vấn trực tiếp qua điện thoại hoặc email theo lịch hẹn của bạn.",
              href: "/consultation",
              cta: "Đăng ký ngay",
            },
          ].map((service) => (
            <div key={service.title} className="bg-white rounded-2xl shadow-sm border border-blue-100 p-7 flex flex-col gap-4 hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className="text-4xl">{service.icon}</div>
              <h3 className="text-xl font-bold text-blue-800">{service.title}</h3>
              <p className="text-gray-600 text-sm flex-grow">{service.desc}</p>
              <Link href={service.href} className="text-blue-600 font-semibold hover:underline text-sm">
                {service.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-blue-50 border border-blue-200 rounded-2xl p-10 text-center space-y-4">
        <h2 className="text-2xl font-bold text-blue-800">Bạn chưa biết chọn ngành nào?</h2>
        <p className="text-gray-600 max-w-lg mx-auto">Hãy để chuyên gia của chúng tôi giúp bạn định hướng. Tư vấn hoàn toàn miễn phí!</p>
        <Link href="/consultation" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-colors shadow-md">
          Liên hệ tư vấn ngay
        </Link>
      </section>
    </div>
  );
}

