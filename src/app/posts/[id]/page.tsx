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

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link href="/posts" className="inline-flex items-center text-blue-600 hover:underline font-medium">
        ← Quay lại danh sách bài viết
      </Link>
      
      <article className="bg-white rounded-2xl shadow-sm border border-blue-50 p-8 space-y-6">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-900 leading-tight">
          {post.title}
        </h1>
        <div className="flex items-center gap-2 text-sm text-gray-500 font-medium pb-6 border-b border-gray-100">
          <span>📅</span>
          <span>{post.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
        </div>
        
        {post.thumbnailUrl && (
          <img src={post.thumbnailUrl} alt={post.title} className="w-full h-auto max-h-[500px] object-cover rounded-xl mt-4 mb-6" />
        )}

        <div 
          className="prose prose-blue max-w-none text-gray-700"
          dangerouslySetInnerHTML={{ __html: post.content }}
        ></div>
      </article>
    </div>
  );
}
