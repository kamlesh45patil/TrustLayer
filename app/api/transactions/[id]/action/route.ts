import { NextResponse } from 'next/server';
import { store } from '@/lib/storage';
import { TransactionStatus } from '@/lib/types';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { action, actor = 'Merchant Ops Admin', notes } = body;

    const validActions: TransactionStatus[] = ['approved', 'held', 'blocked', 'challenged_3ds', 'pending'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updated = store.updateStatus(id, action, actor, notes);
    if (!updated) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const auditLogs = store.getAuditLogs(id);

    return NextResponse.json({
      success: true,
      transaction: updated,
      auditLogs,
    });
  } catch (error) {
    console.error('Error in action route:', error);
    return NextResponse.json({ error: 'Failed to record action' }, { status: 500 });
  }
}
