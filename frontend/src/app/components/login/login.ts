import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private api = inject(Api);
  private auth = inject(Auth);
  private router = inject(Router);

  username = '';
  password = '';
  error = '';
  loading = false;

  login() {
    this.error = '';
    this.loading = true;

    this.api.login(this.username, this.password).subscribe({
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
