import { PaymentMethod } from './method.enum';

export type Payment = {
  id: string;
  loan_id: number;
  amount: number;
  payment_method: PaymentMethod;
  notes: string;
  reference: string;
  created_at?: Date;
  payment_date: Date;
  payment_proof_url?: string;
};
