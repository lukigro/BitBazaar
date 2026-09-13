import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private api = inject(Api);
  private auth = inject(Auth);
  private router = inject(Router);

  username = '';
  password = '';
  password2 = '';
  error = '';
  loading = false;

  register() {
    this.error = '';

    if (this.password !== this.password2) {
      this.error = 'Die Passwörter stimmen nicht überein.';
      return;
    }

    this.loading = true;
    this.api.register(this.username, this.password).subscribe({
      next: (res) => {
        this.auth.setUser(res.data);
        this.router.navigate(['/market']);
      },
      error: (err) => {
        this.error = err.error.error.message;
        this.loading = false;
      }
    });
  }
}
