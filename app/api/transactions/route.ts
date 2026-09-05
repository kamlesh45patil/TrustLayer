import { NextResponse } from 'next/server';
import { store } from '@/lib/storage';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const severity = searchParams.get('severity');
  const status = searchParams.get('status');

  let transactions = store.getAll();

  if (severity && severity !== 'all') {
    transactions = transactions.filter((t) => t.risk_severity === severity);
  }

  if (status && status !== 'all') {
    transactions = transactions.filter((t) => t.status === status);
  }

  // Calculate summary stats
  const total = store.getAll().length;
  const highRisk = store.getAll().filter((t) => t.risk_severity === 'high').length;
  const medRisk = store.getAll().filter((t) => t.risk_severity === 'medium').length;
  const lowRisk = store.getAll().filter((t) => t.risk_severity === 'low').length;
  const heldCount = store.getAll().filter((t) => t.status === 'held' || t.status === 'pending').length;
  const blockedCount = store.getAll().filter((t) => t.status === 'blocked').length;

  const totalGMV = store.getAll().reduce((sum, t) => sum + t.amount, 0);
  const avgScore = total > 0 ? Math.round(store.getAll().reduce((sum, t) => sum + t.risk_score, 0) / total) : 0;

  return NextResponse.json({
    transactions,
    stats: {
      total,
      highRisk,
      medRisk,
      lowRisk,
      heldCount,
      blockedCount,
      totalGMV,
      avgScore,
      falsePositiveRateEst: '1.4%',
    },
  });
}
