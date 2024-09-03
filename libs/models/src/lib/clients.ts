import { Profile } from './profiles';

export type Client = {
  id: string;
  document_id: string;
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  phone_number: string;
  work_place: string;
  salary: number;
  notes: string;
  created_at?: Date;
  created_by?: string;
  user?: Profile;
};
