import { inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Client, Loan } from '@rappi/models';
import { MessageService } from 'primeng/api';
import { SupabaseService } from '../services/supabase.service';

type State = {
  clients: Client[];
  loans: Loan[];
  loading: boolean;
};

export const initialState: State = {
  clients: [],
  loans: [],
  loading: false,
};

export const DashboardStore = signalStore(
  withState(initialState),
  withMethods(
    (
      state,
      supabase = inject(SupabaseService),
      toast = inject(MessageService),
    ) => {
      async function fetchClients() {
        patchState(state, { loading: true });
        const { data, error } = await supabase.client
          .from('clients')
          .select('*');
        if (error) {
          console.error(error);
          patchState(state, { loading: false });
          return;
        }
        patchState(state, { clients: data, loading: false });
      }

      async function fetchLoans() {
        patchState(state, { loading: true });
        const { data, error } = await supabase.client.from('loans').select('*');
        if (error) {
          console.error(error);
          patchState(state, { loading: false });
          return;
        }
        patchState(state, { loans: data, loading: false });
      }

      async function createClient(request: Partial<Client>) {
        patchState(state, { loading: true });
        const { data, error } = await supabase.client
          .from('clients')
          .insert(request)
          .select('*')
          .single();
        if (error) {
          console.error(error);
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error al crear el cliente',
          });
          patchState(state, { loading: false });
          throw error;
        }

        patchState(state, {
          clients: [...state.clients(), data],
          loading: false,
        });
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente creado correctamente',
        });
        return data;
      }

      return { fetchClients, fetchLoans, createClient };
    },
  ),
  withHooks({
    async onInit({ fetchClients, fetchLoans }) {
      await fetchClients();
      await fetchLoans();
    },
  }),
);
