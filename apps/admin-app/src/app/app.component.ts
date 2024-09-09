import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  ConfirmationService,
  MessageService,
  PrimeNGConfig,
} from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ToastModule } from 'primeng/toast';
import es from '../../public/i18n/es.json';
import { AuthStore } from './stores/auth.store';

@Component({
  standalone: true,
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  providers: [MessageService, ConfirmationService, DialogService],
  selector: 'app-root',
  template: `<p-toast /><p-confirmDialog /><router-outlet />`,
  styles: ``,
})
export class AppComponent implements OnInit {
  title = 'admin-app';
  private config = inject(PrimeNGConfig);

  private store = inject(AuthStore);

  ngOnInit(): void {
    this.store.loadProfile();
    this.config.setTranslation(es);
  }
}
