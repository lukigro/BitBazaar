import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-marketplace',
  imports: [FormsModule, RouterLink],
  templateUrl: './marketplace.html',
  styleUrl: './marketplace.css'
})
export class Marketplace implements OnInit {
  private api = inject(Api);

  listings: any[] = [];
  search = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.getListings(this.search).subscribe({
      next: (res) => {
        this.listings = res.data;
      }
    });
  }
}
