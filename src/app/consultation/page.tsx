import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const isSuccess = resolvedSearchParams.success === "1";

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white rounded-2xl px-8 py-10 shadow-md text-center">
        <h2 className="text-3xl font-extrabold mb-2">📞 Đăng Ký Tư Vấn Miễn Phí</h2>
        <p className="text-blue-100">Điền thông tin bên dưới — chuyên gia sẽ liên hệ bạn trong 24 giờ.</p>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        {isSuccess && (
          <div className="mb-6 flex items-start gap-3 p-5 bg-green-50 border border-green-300 text-green-800 rounded-2xl shadow-sm">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-lg">Gửi thành công!</p>
              <p className="text-sm">Chúng tôi đã nhận yêu cầu của bạn và sẽ liên hệ lại trong thời gian sớm nhất.</p>
            </div>
          </div>
        )}

        <form
          action={async (formData) => {
            "use server";
            const name = formData.get("name") as string;
            const phone = formData.get("phone") as string;
            const email = formData.get("email") as string;
            const program = formData.get("program") as string;
            const notes = formData.get("notes") as string;
            if (name && phone) {
              await prisma.consultationRequest.create({
                data: { name, phone, email, program, notes },
              });
              redirect("/consultation?success=1");
            }
          }}
          className="bg-white rounded-2xl shadow-md border border-blue-100 p-8 space-y-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Họ và tên *</label>
              <input name="name" required type="text" placeholder="Nguyễn Văn A" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại *</label>
              <input name="phone" required type="tel" placeholder="0912 345 678" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <input name="email" type="email" placeholder="email@example.com" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Chương trình quan tâm</label>
            <select name="program" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition">
              <option value="">-- Chọn chương trình --</option>
              <option value="DaiHocChinhQuy">🎓 Đại học chính quy</option>
              <option value="CaoDang">📚 Cao đẳng</option>
              <option value="LienThong">🔄 Liên thông - Văn bằng 2</option>
              <option value="ThacSi">🏆 Thạc sĩ</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Ghi chú thêm</label>
            <textarea name="notes" rows={4} placeholder="Bạn muốn hỏi thêm về điểm chuẩn, học phí, chương trình học..." className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition resize-none" />
          </div>

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors">
            Gửi Yêu Cầu Tư Vấn
          </button>
        </form>

        <div className="mt-6 grid grid-cols-3 gap-3 text-center text-sm text-gray-500">
          {[
            { icon: "🔒", text: "Bảo mật thông tin" },
            { icon: "⚡", text: "Phản hồi trong 24h" },
            { icon: "💯", text: "Tư vấn miễn phí" },
          ].map((b) => (
            <div key={b.text} className="bg-white border border-blue-100 rounded-xl py-3 px-2">
              <div className="text-xl mb-1">{b.icon}</div>
              <div>{b.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
