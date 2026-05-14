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

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
        {post.thumbnailUrl && (
          <img src={post.thumbnailUrl} alt={post.title} className="w-full h-80 object-cover" />
        )}
        <div className="p-8 md:p-12 space-y-6">
          <div className="flex items-center justify-between text-sm text-gray-500 font-medium border-b border-gray-200 pb-4">
            <div className="flex items-center gap-2 text-blue-500">
              <span>📅</span>
              <span>{post.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2">
               <span>👁️ {post.viewCount + 1} lượt xem</span>
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {post.title}
          </h1>
          
          <div className="prose prose-blue max-w-none text-gray-700 mt-6" dangerouslySetInnerHTML={{ __html: post.content }}></div>
          
          {post.attachments && (
             <div className="mt-8 pt-6 border-t border-gray-100">
               <h3 className="text-lg font-bold text-gray-800 mb-3">📎 File đính kèm</h3>
               <a href={post.attachments} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                  Tải xuống file đính kèm
               </a>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
