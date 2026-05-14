"use client";

import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function ExportExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    try {
      const exportData = data.map(item => ({
        "Họ và Tên": item.name,
        "Số điện thoại": item.phone,
        "Email": item.email || "",
        "Ngành quan tâm": item.program || "Chưa xác định",
        "Ghi chú": item.notes || "",
        "Trạng thái": item.isProcessed ? "Đã xử lý" : "Cần tư vấn",
        "Ngày đăng ký": new Date(item.createdAt).toLocaleString("vi-VN")
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "TuVan");
      
      XLSX.writeFile(workbook, `Danh_Sach_Tu_Van_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success("Xuất file Excel thành công!");
    } catch (e) {
      toast.error("Lỗi xuất Excel");
    }
  };

  return (
    <button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm">
      <span>📊</span> Xuất Excel
    </button>
  );
}