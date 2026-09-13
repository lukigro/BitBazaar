import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class Theme {
  dark = true;

  constructor() {

    if (localStorage.getItem('theme') === 'light') {
      this.dark = false;
    }
    this.apply();
  }

  toggle() {
    this.dark = !this.dark;
    localStorage.setItem('theme', this.dark ? 'dark' : 'light');
    this.apply();
  }

  apply() {
    if (this.dark) {
      document.body.classList.remove('light');
    } else {
      document.body.classList.add('light');
    }
  }
}
