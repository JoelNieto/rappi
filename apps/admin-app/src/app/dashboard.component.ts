import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { SupabaseService } from './services/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, JsonPipe],
  template: `
    <div class="flex h-screen">
      <!-- Sidebar -->
      <div class="flex flex-col w-64 bg-white border-r border-slate-200">
        <div class="flex flex-col gap-2">
          <a routerLink="/" class="p-4 text-slate-600 font-semibold text-lg"
            >Rappi</a
          >

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
                routerLink="requests"
                routerLinkActive="selected"
                class="px-6 py-3 w-full flex items-center gap-2 rounded-lg text-slate-500 hover:bg-blue-50"
                ><span class="pi pi-users"></span>Solicitudes</a
              >
            </li>
          </ul>
        </div>
      </div>

      <!-- Main content -->
      <div class="flex flex-col flex-1">
        <!-- Main content header -->
        <header class="bg-gray-100 p-4">
          <!-- Header content -->
        </header>

        <!-- Main content body -->
        <main class="flex-1 p-4 h-screen overflow-y-auto">
          {{ supabase.session | json }}
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    .selected {
      @apply bg-blue-100 text-blue-800;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  public supabase = inject(SupabaseService);
}
