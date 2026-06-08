import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import prisma from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const maxDuration = 30;

// Enable CORS for external widgets
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS, POST',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const config = await prisma.systemConfig.findUnique({ where: { key: 'chatbot_gemini_key' } });
    const apiKey = config?.value || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is not configured' }, { status: 400, headers: corsHeaders() });
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
Tuyệt đối không tự bịa đặt, sáng tạo ra thông tin về điểm chuẩn, ngành học hay học phí sai lệch! Thay vào đó, BẮT BUỘC phải trả lời chính xác và y hệt từng chữ đoạn văn sau (không thêm bớt): "Xin lỗi bạn! Hiện tại tôi chưa có câu trả lời chính xác cho câu hỏi của bạn, vui lòng đặt câu hỏi khác hoặc đặt câu hỏi của bạn tại trang https://ts26.nsg.edu.vn/qa sẽ có Chuyên viên tư vấn trả lời cho bạn. Ngoài ra bạn có thể liên hệ hotline tư vấn tuyển sinh 0981146179 hoặc 0908925185 (Thầy Thanh) - 0989695711 (Cô Mai Khanh) nhé!"

Hãy luôn trả lời bằng Tiếng Việt. Xưng hô thân thiện, chuyên nghiệp (ví dụ như: bạn - mình, hoặc em - ban tư vấn/nhà trường). Dùng Markdown để in đậm từ khoá quan trọng, tạo danh sách khi cần thiết.

================ LIÊN KẾT NHÀ TRƯỜNG & KHOA (QUAN TRỌNG) ================
- Link đăng ký xét tuyển / trực tuyến: https://dkts.namsaigon.edu.vn
- Website trường: https://namsaigon.edu.vn
- Website của khoa Cơ khí: https://cokhi.namsaigon.edu.vn
- Fanpage Facebook trường: https://fb.me/namsaigon.edu.vn 
- Fanpage Facebook khoa Cơ khí: https://fb.me/cokhinsg
- Kênh Zalo OA của khoa: https://zalo.me/cokhinsg

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

    const response = result.toTextStreamResponse();
    // Add CORS headers to the response Stream
    for (const [key, value] of Object.entries(corsHeaders())) {
      response.headers.set(key, value);
    }
    return response;
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders() });
  }
}
