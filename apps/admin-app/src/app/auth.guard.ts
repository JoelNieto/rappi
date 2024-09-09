import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from './stores/auth.store';

export const authGuardFn: CanActivateFn = async () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  await sleep(1500);

  return auth.isSignedIn() || router.createUrlTree(['/auth']);
};

function sleep(delay: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => res(), delay);
  });
}
