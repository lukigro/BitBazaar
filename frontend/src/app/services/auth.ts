import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Auth {

  user: any = null;

  constructor() {

    const saved = localStorage.getItem('user');
    if (saved) {
      this.user = JSON.parse(saved);
    }
  }

  setUser(user: any) {
    this.user = user;
    localStorage.setItem('user', JSON.stringify(user));
  }

  logout() {
    this.user = null;
    localStorage.removeItem('user');
  }

  isLoggedIn() {
    return this.user !== null;
  }

  setBalance(balance: number) {
    if (this.user) {
      this.user.balance = balance;
      localStorage.setItem('user', JSON.stringify(this.user));
    }
  }
}
