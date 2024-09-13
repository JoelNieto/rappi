import { inject } from '@angular/core';
import { tapResponse } from '@ngrx/operators';
import {
  patchState,
  signalStore,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { Client, Installment, Loan, Payment } from '@rappi/models';
import { ConfirmationService, MessageService } from 'primeng/api';
import { filter, from, map, pipe, switchMap, tap } from 'rxjs';
import { SupabaseService } from '../services/supabase.service';
import { omit } from '../services/utils';

type State = {
  clients: Client[];
  loans: Loan[];
  loading: boolean;
  currentLoan: Loan | null;
  selectedLoanId: number | null;
};

export const initialState: State = {
  clients: [],
  loans: [],
  loading: false,
  currentLoan: null,
  selectedLoanId: null,
};

export const DashboardStore = signalStore(
  withState(initialState),
  withMethods(
    (
      state,
      supabase = inject(SupabaseService),
      confirmationService = inject(ConfirmationService),
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
        const { data, error } = await supabase.client
          .from('loans')
          .select('*, client:clients(*)');
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

      async function updateClient(request: Client) {
        patchState(state, { loading: true });
        const { error } = await supabase.client.from('clients').upsert(request);
        if (error) {
          console.error(error);
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error al actualizar el cliente',
          });
          patchState(state, { loading: false });
          throw error;
        }
        toast.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Cliente actualizado correctamente',
        });
        patchState(state, {
          clients: state
            .clients()
            .map((client) => (client.id === request.id ? request : client)),
          loading: false,
        });
      }

      async function deleteClient(id: string) {
        patchState(state, { loading: true });
        confirmationService.confirm({
          message: '¿Está seguro de eliminar este cliente?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          rejectButtonStyleClass: 'p-button-text',
          acceptLabel: 'Sí',
          reject: () => patchState(state, { loading: false }),
          accept: async () => {
            const { error } = await supabase.client
              .from('clients')
              .delete()
              .eq('id', id);
            if (error) {
              console.error(error);
              toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error al eliminar el cliente',
              });
              patchState(state, { loading: false });
              throw error;
            }
            toast.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Cliente eliminado correctamente',
            });
            patchState(state, {
              clients: state.clients().filter((client) => client.id !== id),
              loading: false,
            });
          },
        });
      }

      async function createLoan(request: Partial<Loan>) {
        patchState(state, { loading: true });
        try {
          const { data, error } = await supabase.client
            .from('loans')
            .insert(omit(request, 'installments'))
            .select('*')
            .single();
          if (error) {
            throw error;
          }

          const installments = request.installments?.map((x) => ({
            ...x,
            loan_id: data.id,
          }));
          if (installments) {
            await saveInstallments(installments);
          }
          patchState(state, {
            loans: [...state.loans(), data],
            loading: false,
          });
          toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Préstamo creado correctamente',
          });
          return data;
        } catch (err) {
          console.error(err);
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error al crear el préstamo',
          });
          throw err;
        } finally {
          patchState(state, { loading: false });
        }
      }

      async function saveInstallments(installments: Installment[]) {
        const { error } = await supabase.client
          .from('loan_installments')
          .insert(installments);

        if (error) {
          throw error;
        }
      }

      const getLoanById = rxMethod<number | null>(
        pipe(
          tap(() => patchState(state, { currentLoan: null })),
          filter((id) => !!id), // filter out null values
          tap(() => patchState(state, { loading: true })),
          switchMap((id) =>
            from(
              supabase.client
                .from('loans')
                .select(
                  '*, client:clients(*), installments:loan_installments(*), payments:loan_payments(*)',
                )
                .eq('id', id)
                .order('seq', { referencedTable: 'loan_installments' })
                .single(),
            ).pipe(
              map(({ data, error }) => {
                if (error) {
                  throw error;
                }
                return data;
              }),
              tapResponse({
                next: (data) => patchState(state, { currentLoan: data }),
                error: (error) => {
                  console.error(error);
                },
                finalize: () => patchState(state, { loading: false }),
              }),
            ),
          ),
        ),
      );

      async function deleteLoan(id: number) {
        confirmationService.confirm({
          message: '¿Está seguro de eliminar este préstamo?',
          header: 'Confirmación',
          icon: 'pi pi-exclamation-triangle',
          rejectButtonStyleClass: 'p-button-text',
          acceptLabel: 'Sí',
          accept: async () => {
            const { error } = await supabase.client
              .from('loans')
              .delete()
              .eq('id', id);
            if (error) {
              console.error(error);
              toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Ocurrió un error al eliminar el préstamo',
              });
              return;
            }

            toast.add({
              severity: 'success',
              summary: 'Éxito',
              detail: 'Préstamo eliminado correctamente',
            });

            patchState(state, {
              loans: state.loans().filter((loan) => loan.id !== id),
            });
          },
        });
      }

      const setCurrentLoan = (id: number | null) =>
        patchState(state, { selectedLoanId: id });

      async function applyPayment(payment: Payment) {
        const loan = state.currentLoan();
        if (!loan) {
          return;
        }

        patchState(state, { loading: true });

        const installments = loan.installments
          .filter((x) => x.paid_amount < x.amount)
          .sort((a, b) => a.seq - b.seq);
        let amount = payment.amount!;
        const paidInstallments: Partial<Installment>[] = [];

        while (amount > 0 && installments.length > 0) {
          const current = installments[0];
          const remaining = current.amount - current.paid_amount;
          const paid = Math.min(amount, remaining);

          amount -= paid;
          current.paid_amount += paid;
          paidInstallments.push(current);

          installments.shift();
        }

        try {
          const { error } = await supabase.client
            .from('loan_payments')
            .insert(payment);
          await savePaidInstallments(paidInstallments);
          toast.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Pago aplicado correctamente',
          });
          if (error) {
            throw error;
          }
        } catch (err) {
          console.error(err);
          toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Ocurrió un error al aplicar el pago',
          });
          throw err;
        } finally {
          patchState(state, { loading: false });
        }
      }

      async function savePaidInstallments(
        paidInstallments: Partial<Installment>[],
      ) {
        const { error } = await supabase.client
          .from('loan_installments')
          .upsert(paidInstallments);

        if (error) {
          throw error;
        }
      }

      return {
        fetchClients,
        fetchLoans,
        createClient,
        deleteClient,
        createLoan,
        getLoanById,
        setCurrentLoan,
        deleteLoan,
        applyPayment,
        updateClient,
      };
    },
  ),
  withHooks({
    async onInit({ fetchClients, fetchLoans, getLoanById, selectedLoanId }) {
      await fetchClients();
      await fetchLoans();
      getLoanById(selectedLoanId);
    },
  }),
);
