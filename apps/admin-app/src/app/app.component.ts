import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { AuthStore } from './stores/auth.store';

@Component({
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  selector: 'app-root',
  template: `<p-toast /><router-outlet />`,
  styles: ``,
})
export class AppComponent implements OnInit {
  title = 'admin-app';

  private store = inject(AuthStore);

  ngOnInit(): void {
    this.store.loadProfile();
  }
}
