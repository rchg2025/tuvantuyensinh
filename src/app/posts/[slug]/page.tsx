import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDirectImageUrl } from "@/lib/gdrive";
import { Metadata } from "next";
import linkifyHtml from "linkify-html";
import ShareButtons from "@/components/ShareButtons";
import GalleryDisplay from "@/components/GalleryDisplay";
import CommentSection from "../components/CommentSection";
import { cookies } from "next/headers";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({
    where: { slug },
  });

  if (!post) {
    return {
      title: "Không tìm thấy bài viết",
    };
  }

  const imageUrl = post.thumbnailUrl ? getDirectImageUrl(post.thumbnailUrl, true) : undefined;
  
  const siteConfig = await prisma.systemConfig.findUnique({ where: { key: "default_og_image" }});
  const defaultOgImage = siteConfig?.value ? getDirectImageUrl(siteConfig.value, true) : "https://cover-talk.zadn.vn/f/d/8/d/2/a423757e2c651160a43bdd630334ecc7.jpg";
  const finalImageUrl = imageUrl || defaultOgImage;

  return {
    title: post.title,
    description: post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
    openGraph: {
      title: post.title,
      description: post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
      images: [finalImageUrl],
      type: "article",
      url: `https://ts26.nsg.edu.vn/posts/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.content.replace(/<[^>]*>?/gm, '').substring(0, 160) + '...',
      images: [finalImageUrl],
    }
  };
}

export default async function PostDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      comments: {
        where: { isApproved: true, parentId: null },
        orderBy: { createdAt: "desc" },
        include: {
          replies: {
            where: { isApproved: true },
            orderBy: { createdAt: "asc" }
          }
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  // Get current logged in user (if any)
  const cookieStore = await cookies();
  const authId = cookieStore.get("auth_token")?.value;
  const authName = cookieStore.get("auth_name")?.value;
  
  let currentUser = null;
  if (authId && authName) {
    const user = await prisma.systemUser.findUnique({ where: { id: authId } });
    if (user) {
      currentUser = {
        name: decodeURIComponent(authName),
        email: user.email
      };
    }
  }

  // Update view count
  await prisma.post.update({
    where: { id: post.id },
    data: { viewCount: post.viewCount + 1 }
  });

  return (
    <div className="max-w-[1100px] mx-auto space-y-8">
      <Link href="/posts" className="inline-flex items-center text-blue-600 hover:underline font-medium">
        ← Quay lại danh sách
      </Link>

      <div className="bg-white rounded-2xl border border-blue-100 shadow-sm w-full overflow-hidden">
        {post.thumbnailUrl && (
          <img src={getDirectImageUrl(post.thumbnailUrl, 800)} alt={post.title} className="w-full h-auto max-h-[500px] object-cover" />
        )}
        <div className="p-6 md:p-10 w-full overflow-hidden">
          <div className="flex items-center justify-between text-sm text-gray-500 font-medium border-b border-gray-200 pb-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span>📅</span>
                <span>{post.createdAt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>✍️</span>
                <span>{(post as any).authorName || "Đăng bởi Admin"}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1 rounded-full text-gray-600 border border-gray-200">
               <span className="text-gray-400">👁️</span> {post.viewCount + 1} lượt xem
            </div>
          </div>
          
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight break-words mb-8">
            {post.title}
          </h1>
          
          <div 
             className="post-content text-gray-800 leading-relaxed block overflow-x-auto break-words max-w-full w-full" 
             dangerouslySetInnerHTML={{ __html: linkifyHtml(post.content, { defaultProtocol: "https", target: "_blank", rel: "noopener noreferrer", className: "text-blue-600 hover:underline" }) }}
          ></div>

          {post.gallery && post.gallery !== "[]" && (
            <div className="mt-8">
              <GalleryDisplay images={post.gallery} configStr={post.galleryConfig || undefined} />
            </div>
          )}
          
          {post.attachments && (() => {
            let previewUrl = post.attachments;
            if (post.attachments.includes("drive.google.com/uc?export=view&id=")) {
              const id = post.attachments.split("id=")[1]?.split("&")[0];
              if (id) {
                previewUrl = `https://drive.google.com/file/d/${id}/preview`;
              }
            } else if (post.attachments.includes("drive.google.com/file/d/")) {
              previewUrl = post.attachments.replace(/\/view.*$/, "/preview");
            } else if (!post.attachments.toLowerCase().endsWith(".pdf") && post.attachments.startsWith("http")) {
              previewUrl = `https://docs.google.com/gview?url=${encodeURIComponent(post.attachments)}&embedded=true`;
            }

            return (
              <div className="mt-10 pt-6 border-t border-gray-100 bg-gray-50 p-6 rounded-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><span>📎</span> File đính kèm / Tài liệu</h3>
                <a href={post.attachments} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm mb-6">
                    ⬇️ Tải xuống file đính kèm
                </a>
                
                {previewUrl && (
                  <div className="w-full rounded-xl overflow-hidden border border-gray-200 shadow-sm bg-white" style={{ height: "600px" }}>
                    <iframe 
                      src={previewUrl} 
                      className="w-full h-full border-0" 
                      title="File preview"
                      allow="autoplay"
                    ></iframe>
                  </div>
                )}
              </div>
            );
          })()}

          <ShareButtons title={post.title} />
        </div>
      </div>
      
      <div className="mt-12 w-full max-w-4xl mx-auto px-4">
        <CommentSection 
          postId={post.id} 
          initialComments={post.comments as any} 
          currentUser={currentUser}
        />
      </div>
    </div>
  );
}
