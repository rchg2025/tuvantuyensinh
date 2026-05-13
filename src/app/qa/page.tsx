import prisma from "@/lib/prisma";

export default async function QaPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Hỏi Đáp (Q&A)</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-semibold mb-4">Gửi câu hỏi mới</h3>
        <form action={async (formData) => {
          "use server";
          const askerName = formData.get("askerName") as string;
          const question = formData.get("question") as string;
          if (askerName && question) {
            await prisma.question.create({
              data: { askerName, question }
            });
          }
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
            <input name="askerName" required type="text" className="w-full border-gray-300 rounded-md shadow-sm border p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Câu hỏi của bạn</label>
            <textarea name="question" required className="w-full border-gray-300 rounded-md shadow-sm border p-2" rows={3}></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Gửi câu hỏi</button>
        </form>
      </div>

      <div className="space-y-6">
        {questions.length === 0 && <p className="text-gray-500">Chưa có câu hỏi nào.</p>}
        {questions.map(q => (
          <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-lg">Hỏi: {q.question}</h4>
            <p className="text-sm text-gray-500 mb-2">Người hỏi: {q.askerName} - {q.createdAt.toLocaleDateString('vi-VN')}</p>
            {q.answer ? (
              <div className="mt-4 bg-gray-50 p-4 rounded border-l-4 border-blue-500">
                <p className="font-semibold text-blue-800">Đáp:</p>
                <p className="whitespace-pre-wrap">{q.answer}</p>
              </div>
            ) : (
              <p className="mt-4 text-orange-600 bg-orange-50 p-2 text-sm italic inline-block rounded">Đang chờ chuyên gia trả lời...</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
