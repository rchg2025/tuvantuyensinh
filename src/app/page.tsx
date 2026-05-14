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
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white rounded-3xl overflow-hidden shadow-2xl px-8 py-20 text-center">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_50%,white,transparent)]" />
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-block bg-white/20 backdrop-blur text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-2">
            ðŸŽ“ Há»‡ thá»‘ng tÆ° váº¥n tuyá»ƒn sinh trá»±c tuyáº¿n
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Äá»‹nh hÆ°á»›ng tÆ°Æ¡ng lai â€” <br />
            <span className="text-yellow-300">Chá»n Ä‘Ãºng ngÃ nh, Ä‘Ãºng trÆ°á»ng</span>
          </h1>
          <p className="text-blue-100 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Äá»™i ngÅ© chuyÃªn gia luÃ´n sáºµn sÃ ng há»— trá»£ báº¡n trong hÃ nh trÃ¬nh chá»n ngÃ nh há»c phÃ¹ há»£p.
          </p>
          
          {/* Smart Search Bar */}
          <div className="max-w-xl mx-auto mt-8">
            <form action="/qa" method="GET" className="relative flex items-center">
              <span className="absolute left-4 text-gray-400 text-xl">ðŸ”</span>
              <input 
                type="text" 
                name="q"
                placeholder="TÃ¬m kiáº¿m cÃ¢u há»i tÆ° váº¥n..." 
                className="w-full text-gray-900 bg-white shadow-xl rounded-full py-4 pl-12 pr-32 focus:outline-none focus:ring-4 focus:ring-yellow-300 transition-all text-sm font-medium"
              />
              <button type="submit" className="absolute right-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-semibold transition-colors">
                TÃ¬m kiáº¿m
              </button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/consultation" className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-105">
              ÄÄƒng kÃ½ tÆ° váº¥n miá»…n phÃ­ â†’
            </Link>
            <Link href="/qa" className="bg-white/15 hover:bg-white/25 border border-white/40 text-white font-semibold py-3 px-8 rounded-xl transition-all">
              Gá»­i cÃ¢u há»i má»›i
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "BÃ i viáº¿t", value: postCount.toString(), icon: "ðŸ“°" },
          { label: "CÃ¢u há»i Q&A", value: questionCount.toString(), icon: "ðŸ’¬" },
          { label: "ChÆ°Æ¡ng trÃ¬nh", value: "4+", icon: "ðŸŽ¯" },
          { label: "Há»— trá»£", value: "24/7", icon: "ðŸ•’" }
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-blue-50 p-6 text-center hover:-translate-y-1 transition-transform">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-3xl font-extrabold text-blue-700">{stat.value}</div>
            <div className="text-gray-500 text-sm font-medium mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* 5 latest Q&A */}
      <section className="bg-white rounded-2xl shadow-sm border border-blue-50 p-8">
        <div className="md:flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-blue-900">CÃ¢u há»i tÆ° váº¥n má»›i nháº¥t</h2>
            <p className="text-gray-500 mt-1">Nhá»¯ng tháº¯c máº¯c thÆ°á»ng gáº·p Ä‘Æ°á»£c giáº£i Ä‘Ã¡p</p>
          </div>
          <Link href="/qa" className="hidden md:inline-flex text-blue-600 font-semibold hover:underline bg-blue-50 rounded-lg px-4 py-2 mt-4 md:mt-0">
            Xem táº¥t cáº£ cÃ¢u há»i â†’
          </Link>
        </div>

        <div className="grid gap-4">
          {latestQuestions.length > 0 ? (
            latestQuestions.map((q) => (
              <Link key={q.id} href={`/qa`} className="group block bg-gray-50 hover:bg-blue-50/50 rounded-xl p-5 border border-gray-100 hover:border-blue-200 transition-colors">
                <div className="flex gap-4">
                  <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex-shrink-0 text-xl font-bold">
                    Q
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">{q.question}</h3>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{q.answer || 'Đang chờ chuyên gia trả lời...'}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium">
                      <span>ðŸ‘¤ {q.askerName}</span>
                      <span>ðŸ“… {new Date(q.createdAt).toLocaleDateString("vi-VN")}</span>
                      {q.answer !== null ? (
                        <span className="text-green-600 bg-green-100 px-2 py-0.5 rounded text-[10px] font-bold">ÄÃƒ TRáº¢ Lá»œI</span>
                      ) : (
                        <span className="text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded text-[10px] font-bold">CHá»œ DUYá»†T</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
             <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                ChÆ°a cÃ³ cÃ¢u há»i nÃ o.
             </div>
          )}
        </div>
      </section>

      {/* Main Features */}
      <section>
        <h2 className="text-2xl font-extrabold text-blue-900 mb-8 px-2">KhÃ¡m phÃ¡ cÃ¡c chuyÃªn má»¥c</h2>
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            {
              title: "Tin Tá»©c & BÃ i Viáº¿t",
              desc: "Cáº­p nháº­t thÃ´ng Ä‘á»‹nh vá» ká»³ thi, hÆ°á»›ng dáº«n chá»n ngÃ nh, chá»n trÆ°á»ng Äáº¡i há»c - Cao Ä‘áº³ng.",
              link: "/posts",
              color: "sky",
              icon: "ðŸ“°",
            },
            {
              title: "Há»i & ÄÃ¡p (Q&A)",
              desc: "NÆ¡i giáº£i Ä‘Ã¡p má»i tháº¯c máº¯c cá»§a báº¡n vá» quy cháº¿ tuyá»ƒn sinh, Ä‘iá»ƒm chuáº©n, há»“ sÆ¡ nháº­p há»c.",
              link: "/qa",
              color: "indigo",
              icon: "ðŸ’¬",
            },
            {
              title: "ÄÄƒng KÃ½ TÆ° Váº¥n",
              desc: "Äá»ƒ láº¡i thÃ´ng tin, Ä‘á»™i ngÅ© chuyÃªn gia cá»§a chÃºng tÃ´i sáº½ gá»i láº¡i há»— trá»£ báº¡n trá»±c tiáº¿p.",
              link: "/consultation",
              color: "blue",
              icon: "ðŸ“",
            },
          ].map((card) => (
            <Link href={card.link} key={card.title} className="group block focus:outline-none focus:ring-4 focus:ring-blue-100 rounded-2xl">
              <div className="h-full bg-white rounded-2xl p-8 border border-blue-50 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1 relative overflow-hidden group-hover:border-blue-200">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-3xl mb-6 relative">
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800">{card.title}</h3>
                <p className="text-gray-500 leading-relaxed text-sm mb-6">{card.desc}</p>
                <div className="text-blue-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-1">
                  Xem chi tiáº¿t <span>â†’</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA Bottom */}
      <section className="bg-yellow-400 rounded-3xl p-8 md:p-12 text-center shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20 text-6xl">ðŸ””</div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-yellow-950 mb-4">Báº¡n chÆ°a tÃ¬m tháº¥y thÃ´ng tin cáº§n thiáº¿t?</h2>
          <p className="text-yellow-900 font-medium mb-8 max-w-xl mx-auto">
            Äá»«ng ngáº§n ngáº¡i Ä‘á»ƒ láº¡i thÃ´ng tin. Äá»™i ngÅ© chuyÃªn gia sáº½ liÃªn há»‡ tÆ° váº¥n vÃ  giáº£i Ä‘Ã¡p tá»«ng trÆ°á»ng há»£p cá»¥ thá»ƒ.
          </p>
          <Link href="/consultation" className="bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all inline-block hover:scale-105">
            ÄÄƒng kÃ½ nháº­n tÆ° váº¥n ngay
          </Link>
        </div>
      </section>
    </div>
  );
}
