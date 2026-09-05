import { NextResponse } from 'next/server';
import { store } from '@/lib/storage';
import { answerRiskCopilotQuestion } from '@/lib/ai-engine';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { transactionId, question } = body;

    if (!transactionId || !question) {
      return NextResponse.json({ error: 'transactionId and question required' }, { status: 400 });
    }

    const tx = store.getById(transactionId);
    if (!tx) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const answer = await answerRiskCopilotQuestion(question, tx);

    return NextResponse.json({
      success: true,
      answer,
      transactionId,
    });
  } catch (error) {
    console.error('Error in copilot route:', error);
    return NextResponse.json({ error: 'Copilot query failed' }, { status: 500 });
  }
}
