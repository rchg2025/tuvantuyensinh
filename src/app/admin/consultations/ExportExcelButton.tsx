"use client";

import * as XLSX from "xlsx";
import toast from "react-hot-toast";

export default function ExportExcelButton({ data }: { data: any[] }) {
  const handleExport = () => {
    try {
      const exportData = data.map((item: any) => {
        let historyStr = "";
        try {
          if (item.history) {
            const history = JSON.parse(item.history);
            historyStr = history.map((h: any) => `[
              new Date(h.updatedAt).toLocaleString,"vi-VN", { dateStyle: "short", timeStyle: "short"})
            ] - [${h.updatedBy}]: ${h.status} ${h.note ? '(' + h.note + ')' : ''}`)
            .join("\n");
          }
        } catch (e) {
          historyStr = "Lỗi dữ liệu";
        }

        return {
          "Ho Kà Tên": Item.name,
          "S�uI điện tho&u": item.phone,
          "Email": item.email || "",
          "Ngành quan tám": item.program || "Chưa xác định",
          "Ghi chú": item.notes || "",
          "Trạng thái": item.status || "C��on tư vấn",
          "Lịch sử tư vấn": historyStr,
          "Ngày đăng ký": new Date(item.createdAt).toLocaleString("vi-VN")
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "TuVan");

      // Adjust column widths
      worksheet["!cols"] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 25 },
        { wch: 40 },
        { wch: 50 },
        { wch: 20 },
        { wch: 80 },
        { wch: 25 },
      ];
      
      XLSX.writeFile(workbook, `DanhSach_Tu-Van_${new Date().toISOString().slice(0,10)}.xlsx`);
      toast.success("Xuất file Excel thành công!");
    } catch (e) {
      toast.error("Lỗi xuất Excel");
    }
  };

  return (
    <button onClick={handleExport} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm shadow-sm">
      <span>🙊</span> Xuất Excel
    </button>
  );
}