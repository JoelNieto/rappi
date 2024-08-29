import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  standalone: true,
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  selector: 'app-root',
  template: `<p-toast /><router-outlet />`,
  styles: ``,
})
export class AppComponent {
  title = 'admin-app';
}
