import { computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Profile } from '@rappi/models';
import { SupabaseService } from '../services/supabase.service';

type State = {
  user: Profile | null;
  loading: boolean;
};

const initialState: State = { user: null, loading: false };

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((state) => ({
    isSignedIn: computed(() => !!state.user()),
    loading: computed(() => state.loading),
    isAdmin: computed(() => state.user()?.role === 'admin'),
  })),
  withMethods(
    (state, supabase = inject(SupabaseService), router = inject(Router)) => ({
      async signIn({ email, password }: { email: string; password: string }) {
        patchState(state, { loading: true });
        const { error } = await supabase.signInWithPassword({
          email,
          password,
        });
        if (error) {
          console.error(error);
          patchState(state, { loading: false });
          throw error;
        }
        this.loadProfile();
        patchState(state, { loading: false });
        await router.navigate(['/']);
      },
      async loadProfile() {
        patchState(state, { loading: true });
        const profile = await supabase.profile();
        patchState(state, { user: profile, loading: false });
      },
      async updateProfile(profile: Partial<Profile>) {
        patchState(state, { loading: true });
        const { error } = await supabase.updateProfile(profile);
        if (error) {
          console.error(error);

          throw error;
        }

        patchState(state, {
          user: {
            ...state.user(),
            ...profile,
            username: profile.username ?? state.user()?.username ?? '',
          },
        });
      },
      async changePassword(newPassword: string) {
        const { error } = await supabase.changePassword(newPassword);
        if (error) {
          console.error(error);

          throw error;
        }
      },
      signOut() {
        supabase.signOut();
        patchState(state, { user: null });
        router.navigate(['/auth']);
      },
    }),
  ),
);
