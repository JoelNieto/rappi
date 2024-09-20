import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'role',
  standalone: true,
  pure: true,
})
export class RolePipe implements PipeTransform {
  transform(value: 'admin' | 'sales'): string {
    return value === 'admin' ? 'Administrador' : 'Ventas';
  }
}
