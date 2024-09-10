import { computed, inject } from '@angular/core';
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
  })),
  withMethods((state, supabase = inject(SupabaseService)) => ({
    async loadProfile() {
      patchState(state, { loading: true });
      const profile = await supabase.profile();
      patchState(state, { user: profile, loading: false });
    },
    async updateProfile(profile: Profile) {
      patchState(state, { loading: true });
      const { data, error } = await supabase.updateProfile(profile);
      if (error) {
        console.error(error);

        throw error;
      }

      patchState(state, { user: { ...state.user(), ...profile } });
    },
  })),
);
