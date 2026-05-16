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

    // Fetch Q&A data to use as context
    // In a real production app, limit this or use RAG if the dataset is huge.
    const questionsList = await prisma.question.findMany({
      where: {
        answer: {
          not: null,
        }
      },
      select: {
        question: true,
        answer: true,
      },
      take: 50, // Limit to 50 for context size
    });

    const contextContext = questionsList.map((q: any) => `Q: ${q.question}\nA: ${q.answer}`).join('\n\n');

    const systemPrompt = `Bạn là một trợ lý ảo hỗ trợ tuyển sinh của trường đại học/cao đẳng. 
Dưới đây là một số câu hỏi và câu trả lời thường gặp từ bộ dữ liệu của chúng tôi:

${contextContext}

Hãy dựa vào thông tin trên để trả lời câu hỏi của người dùng. Nếu câu hỏi không nằm trong thông tin được cung cấp, hãy trả lời một cách lịch sự, thân thiện và hướng dẫn họ liên hệ trực tiếp với trường qua số điện thoại hoặc email. Luôn trả lời bằng tiếng Việt.`;

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
