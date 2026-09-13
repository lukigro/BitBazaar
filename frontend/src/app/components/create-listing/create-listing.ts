import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-create-listing',
  imports: [FormsModule],
  templateUrl: './create-listing.html',
  styleUrl: './create-listing.css'
})
export class CreateListing {
  private api = inject(Api);
  private router = inject(Router);
  auth = inject(Auth);

  title = '';
  description = '';
  price = 0;
  image = '';
  error = '';

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.image = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  save() {
    this.error = '';
    this.api
      .createListing(this.auth.user.id, this.title, this.description, this.price, this.image)
      .subscribe({
        next: () => {
          this.router.navigate(['/market']);
        },
        error: (err) => {
          this.error = err.error.error.message;
        }
      });
  }
}
