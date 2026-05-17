"use client";

import { useState } from "react";
import toast from "react-hot-toast";

type Question = {
  id: string;
  askerName: string;
  phone: string | null;
  email: string | null;
  question: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: Date | null;
  createdAt: Date;
  isFromSchool: boolean;
  category?: { name: string } | null;
};

export default function QaRow({
  question,
  onUpdate,
  onDelete,
}: {
  question: Question;
  onUpdate: (id: string, data: { answer?: string, question?: string }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [isEditingAnswer, setIsEditingAnswer] = useState(false);
  const [answer, setAnswer] = useState(question.answer || "");
  const [isSavingAnswer, setIsSavingAnswer] = useState(false);

  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [questionText, setQuestionText] = useState(question.question || "");
  const [isSavingQuestion, setIsSavingQuestion] = useState(false);

  const handleUpdateAnswer = async () => {
    setIsSavingAnswer(true);
    try {
      await onUpdate(question.id, { answer });
      setIsEditingAnswer(false);
      toast.success("Đã cập nhật câu trả lời!");
    } catch (e) {
      toast.error("Lỗi khi cập nhật!");
    } finally {
      setIsSavingAnswer(false);
    }
  };

  const handleUpdateQuestion = async () => {
    setIsSavingQuestion(true);
    try {
      await onUpdate(question.id, { question: questionText });
      setIsEditingQuestion(false);
      toast.success("Đã cập nhật câu hỏi!");
    } catch (e) {
      toast.error("Lỗi khi cập nhật!");
    } finally {
      setIsSavingQuestion(false);
    }
  };

  const handleDelete = async () => {
    if (confirm("Chắc chắn muốn xóa câu hỏi này?")) {
      await onDelete(question.id);
    }
  };

  return (
    <tr className="hover:bg-slate-50/50 transition-colors group">
      <td className="p-4 align-top">
        <p className="font-medium text-slate-800">{question.askerName}</p>
        {!question.isFromSchool && (
          <div className="mt-2 space-y-1 text-xs text-slate-500">
            {question.phone && <p>📞 {question.phone}</p>}
            {question.email && <p>✉️ {question.email}</p>}
            {question.category && <p>📚 {question.category.name}</p>}
          </div>
        )}
        {question.isFromSchool && (
          <span className="mt-2 inline-block bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-2 py-0.5 rounded">
            Quản trị - Nội bộ
          </span>
        )}
      </td>
      <td className="p-4 align-top text-slate-600">
        {!isEditingQuestion ? (
          <div>
            <p className="line-clamp-4">{question.question}</p>
            <p className="text-xs text-slate-400 mt-2">{new Date(question.createdAt).toLocaleDateString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 bg-white border border-blue-200 p-3 rounded-lg shadow-sm">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Nhập câu hỏi..."
              autoFocus
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 min-h-[80px]"
            />
            <div className="flex justify-end gap-2 mt-1">
              <button
                onClick={() => {
                  setIsEditingQuestion(false);
                  setQuestionText(question.question || "");
                }}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateQuestion}
                disabled={isSavingQuestion}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs transition-colors disabled:opacity-50"
              >
                {isSavingQuestion ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        )}
      </td>
      <td className="p-4 align-top">
        {!isEditingAnswer ? (
          <div className="flex flex-col gap-2">
            {question.answer ? (
              <div className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                <p className="line-clamp-4">{question.answer}</p>
                <div className="mt-2 text-[10px] text-gray-500 font-medium">
                  { question.answeredBy && question.answeredAt && (
                    <span>
                      Trả lời bởi <strong>{question.answeredBy}</strong> lúc{" "}
                      {new Date(question.answeredAt).toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <span className="text-xs font-semibold text-orange-500 bg-orange-100 px-2 py-1 rounded w-fit">Chưa có câu trả lời</span>
            )}
            <button
              onClick={() => setIsEditingAnswer(true)}
              className="px-3 py-1.5 bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-2 focus:ring-blue-500 rounded-md font-semibold text-xs transition-colors self-start mt-2"
            >
              {question.answer ? "‏️ Cập nhật" : "☍️ Trả lời"}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 relative bg-white border border-blue-200 p-3 rounded-lg shadow-sm">
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Nhập câu trả lời..."
              autoFocus
              className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 min-h-[100px]"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setIsEditingAnswer(false);
                  setAnswer(question.answer || "");
                }}
                className="px-3 py-1.5 text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateAnswer}
                disabled={isSavingAnswer}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold text-xs transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {isSavingAnswer ? "Đang lưu..." : "Lưu lại"}
              </button>
            </div>
          </div>
        )}
      </td>
      <td className="p-4 align-top text-center">
        <div className="flex flex-col items-center gap-2 mt-2">
          {!isEditingQuestion && (
            <button
               onClick={() => setIsEditingQuestion(true)}
               className="text-blue-600 hover:text-blue-800 font-bold px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition text-xs w-full"
            >
               Sửa
            </button>
          )}
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 font-bold px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition text-xs w-full"
          >
            Xóa
          </button>
        </div>
      </td>
    </tr>
  );
}
