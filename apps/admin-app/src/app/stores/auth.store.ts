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
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState({ user: null } as State),
  withComputed((state) => ({
    isSignedIn: computed(() => !!state.user()),
  })),
  withMethods((state, supabase = inject(SupabaseService)) => ({
    async loadProfile() {
      const profile = await supabase.profile();
      patchState(state, { user: profile });
    },
  })),
);
