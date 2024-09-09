import { Injectable } from '@angular/core';
import { Profile } from '@rappi/models';
import {
  AuthChangeEvent,
  AuthSession,
  Session,
  SupabaseClient,
} from '@supabase/supabase-js';
@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  public client: SupabaseClient;
  constructor() {
    this.client = new SupabaseClient(SUPABASE_URL ?? '', SUPABASE_KEY ?? '');
  }

  private _session: AuthSession | null = null;
  private _profile: Profile | null = null;

  get session() {
    this.client.auth.getSession().then(({ data }) => {
      console.log(data);
      this._session = data.session;
    });
    return this._session;
  }

  async currentSession() {
    const { data } = await this.client.auth.getSession();
    return data.session;
  }

  async profile() {
    const session = await this.currentSession();
    const { data } = await this.client
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', session?.user.id)
      .single();
    return data;
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    return this.client.auth.onAuthStateChange(callback);
  }

  signIn(email: string) {
    return this.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: REDIRECT_URI },
    });
  }
}