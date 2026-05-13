import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function ConsultationPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedSearchParams = await searchParams;
  const isSuccess = resolvedSearchParams.success === "1";

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-blue-700 text-center">Đăng Ký Tư Vấn</h2>
      <p className="text-center text-gray-600 mb-8">Điền thông tin của bạn vào form dưới đây, chúng tôi sẽ liên hệ lại trong thời gian sớm nhất.</p>
      
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
          <p className="font-semibold">Cảm ơn bạn!</p>
          <p>Yêu cầu tư vấn của bạn đã được gửi thành công. Chúng tôi sẽ sớm liên hệ lại.</p>
        </div>
      )}

      <form action={async (formData) => {
        "use server";
        const name = formData.get("name") as string;
        const phone = formData.get("phone") as string;
        const email = formData.get("email") as string;
        const program = formData.get("program") as string;
        const notes = formData.get("notes") as string;

        if (name && phone) {
          await prisma.consultationRequest.create({
            data: { name, phone, email, program, notes }
          });
          redirect("/consultation?success=1");
        }
      }} className="bg-white p-8 rounded-xl shadow-md border space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên *</label>
            <input name="name" required type="text" className="w-full border-gray-300 rounded-md shadow-sm border p-2" placeholder="VD: Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
            <input name="phone" required type="tel" className="w-full border-gray-300 rounded-md shadow-sm border p-2" placeholder="0912345678" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input name="email" type="email" className="w-full border-gray-300 rounded-md shadow-sm border p-2" placeholder="email@example.com" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Chương trình quan tâm</label>
          <select name="program" className="w-full border-gray-300 rounded-md shadow-sm border p-2 bg-white">
            <option value="">-- Chọn chương trình --</option>
            <option value="DaiHocChinhQuy">Đại học chính quy</option>
            <option value="CaoDang">Cao đẳng</option>
            <option value="LienThong">Liên thông - Văn bằng 2</option>
            <option value="ThacSi">Thạc sĩ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú thêm</label>
          <textarea name="notes" className="w-full border-gray-300 rounded-md shadow-sm border p-2" rows={4} placeholder="Bạn cần hỏi thêm về..."></textarea>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 transition">
          Gửi Yêu Cầu
        </button>
      </form>
    </div>
  );
}
