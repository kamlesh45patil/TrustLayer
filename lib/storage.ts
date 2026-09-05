// TrustLayer Storage & In-Memory Store
// Provides seamless persistence and live event dispatching across client and server

import { Transaction, AuditLogEntry, TransactionStatus } from './types';
import { INITIAL_TRANSACTIONS } from './mock-data';

// Server-side in-memory singleton store
class TransactionStore {
  private transactions: Transaction[] = [...INITIAL_TRANSACTIONS];
  private auditLogs: AuditLogEntry[] = [
    {
      id: 'audit_01',
      transaction_id: 'txn_rzp_legit_01',
      action: 'approved',
      previous_status: 'pending',
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      actor: 'Razorpay Auto-Decision Engine',
      rationale_summary: 'Auto-approved: Risk score 14/100 within safe bounds.',
    },
    {
      id: 'audit_02',
      transaction_id: 'txn_rzp_fraud_02',
      action: 'held',
      previous_status: 'pending',
      timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      actor: 'Ops Reviewer (Merchant Admin)',
      rationale_summary: 'Held: Flagged 4x velocity and billing mismatch.',
    },
  ];

  public getAll(): Transaction[] {
    return [...this.transactions];
  }

  public getById(id: string): Transaction | undefined {
    return this.transactions.find((t) => t.id === id);
  }

  public add(transaction: Transaction): Transaction {
    this.transactions.unshift(transaction);
    return transaction;
  }

  public updateStatus(
    id: string,
    status: TransactionStatus,
    actor: string = 'Merchant Ops',
    notes?: string
  ): Transaction | null {
    const txIndex = this.transactions.findIndex((t) => t.id === id);
    if (txIndex === -1) return null;

    const tx = this.transactions[txIndex];
    const prevStatus = tx.status;
    const updatedTx: Transaction = {
      ...tx,
      status,
      actioned_at: new Date().toISOString(),
      actioned_by: actor,
      action_note: notes,
    };

    this.transactions[txIndex] = updatedTx;

    // Record audit entry
    this.auditLogs.unshift({
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      transaction_id: id,
      action: status,
      previous_status: prevStatus,
      timestamp: new Date().toISOString(),
      actor,
      rationale_summary: `Merchant changed status to ${status.toUpperCase()}${notes ? `: ${notes}` : ''}`,
      notes,
    });

    return updatedTx;
  }

  public getAuditLogs(transactionId?: string): AuditLogEntry[] {
    if (transactionId) {
      return this.auditLogs.filter((a) => a.transaction_id === transactionId);
    }
    return [...this.auditLogs];
  }

  public resetToDefault(): void {
    this.transactions = [...INITIAL_TRANSACTIONS];
  }
}

// Global singleton to prevent memory re-init in development hot reloading
const globalForStore = globalThis as unknown as { transactionStore?: TransactionStore };

export const store = globalForStore.transactionStore || new TransactionStore();
if (process.env.NODE_ENV !== 'production') globalForStore.transactionStore = store;
