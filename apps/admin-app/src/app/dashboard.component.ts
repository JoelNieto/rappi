import { AsyncPipe, JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { SupabaseService } from './services/supabase.service';
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
  ],
  template: `
    <nav
      class="bg-white border border-b-slate-200 flex fixed z-30 w-full items-center justify-between px-4 py-3"
    >
      <div class="flex items-center gap-4">
        <button class="p-2 text-slate-500">
          <span class="pi pi-bars"></span>
        </button>
        <a class="text-2xl font-semibold text-slate-600 mb-0">Rappi</a>
      </div>
      <div>
        <p-menu #menu [model]="menuItems" [popup]="true" />
        <p-button
          icon="pi pi-user"
          text
          rounded
          (onClick)="menu.toggle($event)"
        />
      </div>
    </nav>
    <div class="flex h-screen pt-16 overflow-hidden">
      <!-- Sidebar -->
      <aside
        class="flex fixed flex-col pt-4 w-64 h-full bg-white border-r border-slate-200"
      >
        <div class="flex flex-col justify-between">
          <div>
            <ul class="flex flex-col gap-1 px-2">
              <li>
                <a
                  routerLink="home"
                  routerLinkActive="selected"
                  class="px-6 py-3 w-full flex items-center gap-2 rounded-lg text-slate-500 hover:bg-blue-50"
                  ><span class="pi pi-home"></span> Inicio</a
                >
              </li>
              <li>
                <a
                  routerLink="clients"
                  routerLinkActive="selected"
                  class="px-6 py-3 w-full flex items-center gap-2 rounded-lg text-slate-500 hover:bg-blue-50"
                  ><span class="pi pi-users"></span>Clientes</a
                >
              </li>
              <li>
                <a
                  routerLink="loans"
                  routerLinkActive="selected"
                  class="px-6 py-3 w-full flex items-center gap-2 rounded-lg text-slate-500 hover:bg-blue-50"
                  ><span class="pi pi-money-bill"></span>Prestamos</a
                >
              </li>
            </ul>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="ms-64 overflow-auto relative w-full p-4 h-full">
        <!-- Main content body -->

        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .selected {
      @apply text-blue-800 font-semibold;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public supabase = inject(SupabaseService);
  menuItems: MenuItem[] = [
    {
      label: 'Ajustes',
      items: [{ label: 'Perfil', icon: 'pi pi-user', routerLink: 'profile' }],
    },
  ];
}
