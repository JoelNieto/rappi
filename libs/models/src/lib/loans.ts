import { Client } from './clients';
import { Installment } from './installments';
import { Payment } from './payments';
import { Recurrence } from './recurrence.enum';

export type Loan = {
  id?: number;
  product: string;
  price_base: number;
  commerce: string;
  client_id: string;
  client?: Partial<Client>;
  created_by?: string;
  rate: number;
  installments_count: number;
  installments: Installment[];
  recurrent_id: Recurrence;
  installment_amount: number;
  first_payment_date: Date;
  payments?: Payment[];
  created_at: Date;
  status_id: number;
};