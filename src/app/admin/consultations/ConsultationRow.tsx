"use client";

import { useState, useTransition } from "react";
import { updateConsultationStatus, deleteConsultationRequest } from "./actions";

type HistoryEntry = {
  status: string;
  note: string;
  updatedBy: string;
  updatedAt: string;
};

export default function ConsultationRow({ request }: { request: any }) {
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleting] = useTransition();
  const [isEditing, setIsEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const initialStatus = request.status || "Cần tư vấn";
  const [status, setStatus] = useState(initialStatus);
  const [note, setNote] = useState("");

  const history: HistoryEntry[] = request.history ? JSON.parse(request.history) : [];

  const handleUpdate = () => {
    startTransition(async () => {
      await updateConsultationStatus(request.id, status, note);
      setIsEditing(false);
      setNote("");
    });
  };

  const statusColors: Record<string, string> = {
    "Cần tư vấn": "text-red-700 bg-red-100",
    "Đang tư vấn": "text-blue-700 bg-blue-100",
    "Tư vấn chuyên sâu": "text-amber-700 bg-amber-100",
    "Đã tư vấn": "text-emerald-700 bg-emerald-100",
  };

  return (
    <>
      <tr className={`hover:bg-slate-50 transition-colors ${request.isProcessed ? "opacity-60" : ""}`}>
        <td className="p-4 align-top">
          <p className="font-bold text-slate-800">{request.name}</p>
          <p className="text-blue-600 font-medium">📞 {request.phone}</p>
          {request.email && <p className="text-slate-500 text-xs mt-1">📧 {request.email}</p>}
        </td>
        <td className="p-4 font-semibold text-slate-700 align-top">{request.program || "Chưa xác định"}</td>
        <td className="p-4 text-slate-600 max-w-xs truncate align-top" title={request.notes}>
          {request.notes}
        </td>
        <td className="p-4 text-center align-top">
          {!isEditing ? (
            <div className="flex flex-col items-center gap-2">
              <span className={`${statusColors[initialStatus] || statusColors["Cần tư vấn"]} px-3 py-1 rounded-full text-xs font-bold uppercase block w-max`}>
                {initialStatus}
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-xs text-blue-600 hover:underline"
              >
                Thay đổi
              </button>
              {history.length > 0 && (
                <button 
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  {showHistory ? "Đóng lịch sử" : "Xem lịch sử"}
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3 min-w-[200px]">
              <select
                value={status}
                title="Trạng thái"
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Cần tư vấn">Cần tư vấn</option>
                <option value="Đang tư vấn">Đang tư vấn</option>
                <option value="Tư vấn chuyên sâu">Tư vấn chuyên sâu</option>
                <option value="Đã tư vấn">Đã tư vấn</option>
              </select>
              
              {status === "Tư vấn chuyên sâu" && (
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nội dung cần tư vấn chuyên sâu..."
                  className="w-full text-sm border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={2}
                />
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  disabled={isPending}
                  className="flex-1 bg-blue-600 text-white text-xs font-bold py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isPending ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setStatus(initialStatus);
                    setNote("");
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded-lg hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
        </td>
        <td className="p-4 text-center space-y-2 align-top">
          <button 
            onClick={() => startDeleting(() => deleteConsultationRequest(request.id))}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 font-bold px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition text-xs w-full disabled:opacity-50"
          >
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </button>
        </td>
      </tr>
      {showHistory && history.length > 0 && (
        <tr className="bg-slate-50">
          <td colSpan={5} className="p-4 border-b border-slate-100">
            <div className="max-w-3xl mx-auto bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-800 mb-3 border-b pb-2">Lịch sử thay đổi trạng thái</h4>
              <div className="space-y-3">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-3 text-sm">
                    <div className="text-slate-400 whitespace-nowrap text-xs mt-0.5">
                      {new Date(h.updatedAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-700">{h.updatedBy}</p>
                      <p className="mt-1">
                        Chuyển sang: <span className={`${statusColors[h.status]} px-2 py-0.5 rounded text-[10px] uppercase font-bold`}>{h.status}</span>
                      </p>
                      {h.note && (
                        <div className="mt-1.5 text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 italic text-xs">
                          {h.note}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
