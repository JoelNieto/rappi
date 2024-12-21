import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import { AuthStore } from './stores/auth.store';

@Component({
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService, DialogService],
  selector: 'app-root',
  template: `<p-toast /><p-confirmDialog /><router-outlet />`,
  styles: ``,
})
export class AppComponent implements OnInit {
  title = 'admin-app';

  private store = inject(AuthStore);

  ngOnInit(): void {
    this.store.loadProfile();
  }
}
