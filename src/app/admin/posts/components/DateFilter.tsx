"use client";

export default function DateFilter({ defaultStartDate, defaultEndDate }: { defaultStartDate: string; defaultEndDate: string }) {
  return (
    <div className="flex gap-2 w-full md:w-auto">
      <input 
        type="date" 
        name="startDate" 
        className="w-full md:w-36 text-slate-800 bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
        defaultValue={defaultStartDate || ""}
        onChange={(e) => e.target.form?.submit()}
        title="Từ ngày"
      />
      <span className="flex items-center text-slate-500">-</span>
      <input 
        type="date" 
        name="endDate" 
        className="w-full md:w-36 text-slate-800 bg-white border border-slate-200 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
        defaultValue={defaultEndDate || ""}
        onChange={(e) => e.target.form?.submit()}
        title="Đến ngày"
      />
    </div>
  );
}
