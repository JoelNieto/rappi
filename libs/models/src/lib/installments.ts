export type Installment = {
  id: string;
  loan_id?: string;
  seq: number;
  amount: number;
  paid_amount: number;
  due_date: Date;
  created_at?: number;
};

export enum InstallmentStatus {
  Paid = 'paid',
  Pending = 'pending',
  Overdue = 'overdue',
}
