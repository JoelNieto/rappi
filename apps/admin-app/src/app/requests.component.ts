import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule],
  template: `<p>requests works!</p>`,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RequestsComponent {}
