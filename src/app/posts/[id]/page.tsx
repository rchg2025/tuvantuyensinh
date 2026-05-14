import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const post = await prisma.post.findUnique({
    where: { id },
  });

  if (!post) {
    notFound();
  }

  // Update view count
  await prisma.post.update({
    where: { id },
    data: { viewCount: post.viewCount + 1 }
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/posts" className="inline-flex items-center text-blue-600 hover:underline font-medium">
        ← Quay lại danh sách
      </Link>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm w-full overflow-hidden">
        {post.thumbnailUrl && (
          <img src={post.thumbnailUrl} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
        )}
        <div className="p-6 md:p-10 w-full overflow-hidden">
          <div className="flex items-center justify-between text-sm text-gray-500 font-medium border-b border-gray-200 pb-4 mb-6">
            <div className="flex items-center gap-1">
              <span>📅</span>
              <span>{post.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-gray-600 border border-gray-200">
               <span className="text-gray-400">👁️</span> {post.viewCount + 1} lượt xem
            </div>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight break-words mb-8">
            {post.title}
          </h1>
          
          <div 
             className="post-content text-gray-800 leading-relaxed block overflow-x-hidden" 
             style={{ wordWrap: "break-word", overflowWrap: "break-word", maxWidth: "100%", width: "100%" }}
             dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
          
          {post.attachments && (
             <div className="mt-10 pt-6 border-t border-gray-100 bg-gray-50 p-6 rounded-xl">
               <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📎</span> File đính kèm / Tài liệu</h3>
               <a href={post.attachments} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
                  ⬇️ Tải xuống file đính kèm
               </a>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
