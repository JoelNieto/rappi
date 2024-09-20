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
  public admin: SupabaseClient;
  constructor() {
    console.log(process.env['SUPABASE_URL']);
    this.client = new SupabaseClient(
      process.env['SUPABASE_URL'] ?? '',
      process.env['SUPABASE_KEY'] ?? '',
    );
    this.admin = new SupabaseClient(
      process.env['SUPABASE_URL'] ?? '',
      process.env['SUPABASE_SERVICE_ROLE'] ?? '',
    );
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
      .select('id, username, full_name, avatar_url, role')
      .eq('id', session?.user.id)
      .single();
    return data;
  }

  updateProfile(user: Partial<Profile>) {
    const update = { ...user, updated_at: new Date() };
    return this.client.from('profiles').upsert(update).single();
  }

  authChanges(
    callback: (event: AuthChangeEvent, session: Session | null) => void,
  ) {
    return this.client.auth.onAuthStateChange(callback);
  }

  signIn(email: string) {
    return this.client.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: process.env['REDIRECT_URI'] },
    });
  }

  signInWithPassword({ email, password }: { email: string; password: string }) {
    return this.client.auth.signInWithPassword({ email, password });
  }

  resetPassword(email: string) {
    return this.client.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env['REDIRECT_URI']}/change-password`,
    });
  }

  inviteUser(email: string) {
    return this.admin.auth.admin.inviteUserByEmail(email);
  }

  changePassword(password: string) {
    return this.client.auth.updateUser({ password });
  }

  signOut() {
    return this.client.auth.signOut();
  }
}
