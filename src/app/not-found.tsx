import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "404 - Không tìm thấy trang",
  description: "Trang bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.",
};

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-blue-50 p-10 md:p-16 max-w-2xl w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-yellow-50 rounded-full blur-2xl -ml-10 -mb-10 opacity-60 pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-400 mb-2 drop-shadow-sm">
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">
            Ôi không! Lạc đường rồi...
          </h2>
          <p className="text-gray-500 mb-10 max-w-md mx-auto text-lg">
            Trang bạn đang tìm kiếm có thể đã bị xoá, đổi tên, hoặc tạm thời không thể truy cập.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>🏠</span> Về trang chủ
            </Link>
            <Link 
              href="/search" 
              className="w-full sm:w-auto bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold py-3 px-8 rounded-xl border border-gray-200 transition-all flex items-center justify-center gap-2"
            >
              <span>🔍</span> Tìm kiếm thông tin
            </Link>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
            Cần hỗ trợ gấp? Hãy gọi <a href="tel:0123456789" className="text-blue-500 font-semibold hover:underline">Hotline tư vấn</a> hoặc để lại câu hỏi ở phần <Link href="/qa" className="text-blue-500 font-semibold hover:underline">Hỏi Đáp</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}
