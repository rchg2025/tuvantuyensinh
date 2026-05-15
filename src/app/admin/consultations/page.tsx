import prisma from "@/lib/prisma";
import ExportExcelButton from "./ExportExcelButton";
import ConsultationRow from "./ConsultationRow";
import ConsultationsFilter from "./ConsultationsFilter";
import Pagination from "./Pagination";

export const dynamic = "force-dynamic";

export default async function AdminConsultationsPage(props: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
  const searchParams = await props.searchParams;
  const q = searchParams.q || "";
  const status = searchParams.status || "";
const program = searchParams.program || "";
  const page = parseInt(searchParams.page || "1", 10);
  const pageSize = 10;

  let where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (status) {
    where.status = status;
  }
  if (program) {
    where.program = program;
  }

  // Get distinct programs for filter
  const distinctProgramsRaw = await prisma.consultationRequest.findMany({
    where: { program: { not: null } },
    select: { program: true },
    distinct: ['program']
  });
  const programsList = distinctProgramsRaw.map(p => p.program).filter(Boolean) as string[];

  const total = await prisma.consultationRequest.count({ where });
  const totalPages = Math.ceil(total / pageSize);

  const requests = await prisma.consultationRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  // Full list for export
  const allFilteredRequests = await prisma.consultationRequest.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center sm:items-start flex-col sm:flex-row gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thông tin liên hệ & Tư vấn</h1>
          <p className="text-slate-500">Danh sách học viên để lại thông tin cần tư vấn huặc gọi lại.</p>
        </div>
        <ExportExcelButton data={allFilteredRequests as any} />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <ConsultationsFilter 
          q={q} 
          status={status} 
          program={program} 
          availablePrograms={programsList} 
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto w-full"><table className="w-full text-left min-w-[800px]">
          <thead className="bg-slate-50 border-b border-slate-100 text-sm font-semibold text-slate-600">
            <tr>
              <th className="p-4">Thông tin HV</th>
              <th className="p-4">Ngành quan tâm</th>
              <th className="p-4">Ghi chú</th>
              <th className="p-4 text-center">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {requests.map((r) => (
              <ConsultationRow key={r.id} request={r} />
            ))}
            {requests.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Không tìm thấy hoặc chưa có ai đăng ký tư vấn.</td></tr>
            )}
          </tbody>
        </table></div>
        
        {totalPages > 1 && (
           <div className="p-4 border-t border-slate-100 flex justify-center bg-slate-50">
             <Pagination currentPage={page} totalPages={totalPages} />
           </div>
        )}
      </div>
    </div>
  );
}