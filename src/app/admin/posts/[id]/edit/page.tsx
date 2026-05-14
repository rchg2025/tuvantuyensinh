import prisma from "@/lib/prisma";
import PostForm from "../../components/PostForm";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });
  
  if (!post) notFound();
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h1 className="text-2xl font-bold text-slate-800">Chỉnh sửa bài viết</h1>
        <Link href="/admin/posts" className="text-blue-600 hover:underline">Quay lại danh sách</Link>
      </div>
      <PostForm defaultValues={post} />
    </div>
  );
}
