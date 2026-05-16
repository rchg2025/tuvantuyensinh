import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const config = await prisma.systemConfig.findUnique({ where: { key: 'chatbot_gemini_key' } });
    const apiKey = config?.value || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured' }, { status: 400 });
    }

    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    // 1. Fetch Q&A data to use as context
    const questionsList = await prisma.question.findMany({
      where: {
        answer: { not: null },
      },
      select: {
        question: true,
        answer: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100, // Tăng thêm câu hỏi đáp
    });

    const qaContext = questionsList.map((q: any) => `Hỏi: ${q.question}\nĐáp: ${q.answer}`).join('\n\n');

    // 2. Lấy dữ liệu bài đăng (Thông tin tuyển sinh, tin tức, ngành nghề)
    const postsList = await prisma.post.findMany({
      select: {
        title: true,
        content: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20, // Giới hạn số lượng bài để không làm tràn token
    });

    // Hàm loại bỏ HTML tag khỏi bài viết để tiết kiệm dung lượng context token
    const stripHtml = (html: string) => html.replace(/<[^>]*>?/gm, '');

    const postContext = postsList.map((p: any) => {
      // Chỉ lấy tối đa 1500 ký tự đầu tiên của mỗi nội dung bài đăng
      const cleanContent = stripHtml(p.content).substring(0, 1500); 
      return `Bài viết: ${p.title}\nNội dung: ${cleanContent}...`;
    }).join('\n\n');


    const systemPrompt = `Bạn là một chuyên viên/trợ lý ảo tư vấn tuyển sinh chuyên nghiệp của trường. Nhiệm vụ của bạn là giải đáp tất cả các thắc mắc cho học sinh, phụ huynh một cách chính xác dựa trên nguồn dữ liệu Hỏi & Đáp và các Bài viết trên website của nhà trường do tôi cung cấp bên dưới.

NẾU THÔNG TIN CÓ TRONG KHO DỮ LIỆU:
Hãy tổng hợp, phân tích thông tin từ phần Hỏi & Đáp và Bài viết để trả lời một cách chính xác, thân thiện, súc tích và dễ hiểu.

NẾU THÔNG TIN KHÔNG CÓ HOẶC KHÔNG CHẮC CHẮN NẰM TRONG CÁC DỮ LIỆU BÊN DƯỚI:
Tuyệt đối không tự bịa đặt, sáng tạo ra thông tin về điểm chuẩn, ngành học hay học phí sai lệch! Hãy xin lỗi một cách lịch sự, nói rằng bạn hiện tại chưa cập nhật thông tin này và vui lòng hướng dẫn họ gửi câu hỏi qua trang "Hỏi đáp" của website hoặc liên hệ trực tiếp với Phòng Tư vấn theo hotline/email cung cấp dưới chân trang.

Hãy luôn trả lời bằng Tiếng Việt. Xưng hô thân thiện, chuyên nghiệp (ví dụ như: bạn - mình, hoặc em - ban tư vấn/nhà trường). Dùng Markdown để in đậm từ khoá quan trọng, tạo danh sách khi cần thiết.

================ KHỞI ĐẦU DỮ LIỆU HỎI ĐÁP (Q&A) ================
${qaContext}

================ KHỞI ĐẦU DỮ LIỆU BÀI VIẾT ================
${postContext}
`;

    const result = streamText({
      model: google('gemini-2.5-flash'), // or gemini-2.5-pro for better reasoning
      system: systemPrompt,
      messages,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
