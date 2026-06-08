import { NextResponse } from 'next/server';
import { notifyChatbotRating } from '@/lib/mail';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { rating, feedback, history } = data;

    if (!rating || !history || !Array.isArray(history)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ' }, { status: 400 });
    }

    await notifyChatbotRating({ rating, feedback, history });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Lỗi khi gửi đánh giá chatbot:', error);
    return NextResponse.json({ error: 'Đã có lỗi xảy ra' }, { status: 500 });
  }
}
