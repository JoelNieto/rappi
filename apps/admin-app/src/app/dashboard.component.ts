import { AsyncPipe, JsonPipe, NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SupabaseService } from './services/supabase.service';
import { AuthStore } from './stores/auth.store';
import { DashboardStore } from './stores/dashboard.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  providers: [DashboardStore],
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MenuModule,
    JsonPipe,
    AsyncPipe,
    ButtonModule,
    NgClass,
  ],
  template: `
    <nav
      class="bg-white border border-b-slate-200 flex fixed z-30 w-full items-center justify-between px-4 py-3"
    >
      <div class="flex items-center gap-4">
        <p-button
          icon="pi pi-bars"
          rounded
          text
          severity="secondary"
          (onClick)="toggleMenu()"
        />
        <a class="text-2xl font-semibold text-slate-600 mb-0">Rappi</a>
      </div>
      <div>
        <p-menu #menu [model]="menuItems" [popup]="true" />
        <p-button
          icon="pi pi-user"
          text
          [label]="auth.user() ? auth.user()?.full_name : 'Usuario'"
          rounded
          (onClick)="menu.toggle($event)"
        />
      </div>
    </nav>
    <div class="flex h-screen pt-16 overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="flex fixed flex-col pt-4 h-full bg-white border-r border-slate-200"
        [class.w-16]="collapsed()"
        [class.w-64]="!collapsed()"
      >
        <div class="flex flex-col justify-between">
          <div>
            <ul class="flex flex-col gap-1 px-2">
              <li>
                <a
                  routerLink="home"
                  routerLinkActive="selected"
                  class="px-6 py-3 w-full flex items-center gap-2 rounded-lg text-slate-500 hover:bg-blue-50"
                  [ngClass]="{ 'px-0 justify-center': collapsed() }"
                  ><span class="pi pi-home"></span>
                  <span [class.hidden]="collapsed()"> Inicio </span>
                </a>
              </li>
              <li>
                <a
                  routerLink="clients"
                  routerLinkActive="selected"
                  class="px-6 py-3 w-full flex items-center gap-2 rounded-lg text-slate-500 hover:bg-blue-50"
                  [ngClass]="{ 'px-0 justify-center': collapsed() }"
                  ><span class="pi pi-users"></span>
                  <span [class.hidden]="collapsed()"> Clientes </span>
                </a>
              </li>
              <li>
                <a
                  routerLink="loans"
                  routerLinkActive="selected"
                  class="px-6 py-3 w-full flex items-center gap-2 rounded-lg text-slate-500 hover:bg-blue-50"
                  [ngClass]="{ 'px-0 justify-center': collapsed() }"
                  ><span class="pi pi-money-bill"></span>
                  <span [class.hidden]="collapsed()">Prestamos</span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
      <main
        class="overflow-auto relative w-full p-4 h-full bg-slate-50"
        [class.ms-16]="collapsed()"
        [class.ms-64]="!collapsed()"
      >
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .selected {
      @apply text-blue-700 font-semibold;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public supabase = inject(SupabaseService);
  protected auth = inject(AuthStore);
  protected collapsed = signal(false);
  protected menuItems: MenuItem[] = [
    {
      label: 'Ajustes',
      items: [{ label: 'Perfil', icon: 'pi pi-user', routerLink: 'profile' }],
    },
  ];

  protected toggleMenu = () => this.collapsed.update((x) => !x);
}
