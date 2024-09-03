export type Loan = {
  id: string;
  product: string;
  price_base: number;
  commerce: string;
  client_id: string;
  created_by: string;
  rate: number;
  installments: number;
  recurrent_id: number;
  installment_amount: number;
  first_payment_date: Date;
  created_at: Date;
  status_id: number;
};
