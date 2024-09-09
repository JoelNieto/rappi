import { FormGroup } from '@angular/forms';

export function omit(obj: any, ...props: any[]) {
  const result = { ...obj };
  props.forEach(function (prop) {
    delete result[prop];
  });
  return result;
}

export function markGroupAsDirty(group: FormGroup) {
  Object.values(group.controls).forEach((control) => {
    control.markAsDirty();
  });
}
