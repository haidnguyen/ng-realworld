import { Injectable, signal } from '@angular/core';
import { User } from '@ng-realworld/data-access/model';
import { injectTRPC } from '@ng-realworld/data-access/trpc-client';

const STORAGE_TOKEN_KEY = '__TOKEN__';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly client = injectTRPC();
  readonly currentUser = signal<User | null>(null);
  readonly isAuth = signal(!!localStorage.getItem(STORAGE_TOKEN_KEY));

  authenticated(user: User) {
    this.currentUser.set(user);
    this.isAuth.set(true);
  }

  registerToken(token: string) {
    localStorage.setItem(STORAGE_TOKEN_KEY, token);
  }

  getToken() {
    return localStorage.getItem(STORAGE_TOKEN_KEY);
  }

  logout() {
    this.client.user.logout.mutate();
    localStorage.clear();
    this.isAuth.set(false);
  }
}
