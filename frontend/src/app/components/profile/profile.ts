import { Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile',
  imports: [RouterLink, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile implements OnInit {
  private api = inject(Api);
  auth = inject(Auth);

  inventory: any[] = [];
  myListings: any[] = [];
  myOffers: any[] = [];
  transactions: any[] = [];
  rounds: any[] = [];
  leaderboard: any[] = [];
  error = '';

  ngOnInit() {
    if (!this.auth.isLoggedIn()) {
      return;
    }

    const id = this.auth.user.id;

    this.api.getUser(id).subscribe({
      next: (res) => {
        this.auth.setBalance(res.data.balance);
      }
    });

    this.api.getInventory(id).subscribe({
      next: (res) => {
        this.inventory = res.data;
      }
    });

    this.api.getMyListings(id).subscribe({
      next: (res) => {
        this.myListings = res.data;
      }
    });

    this.api.getMyOffers(id).subscribe({
      next: (res) => {
        this.myOffers = res.data;
      }
    });

    this.api.getTransactions(id).subscribe({
      next: (res) => {
        this.transactions = res.data;
      }
    });

    this.api.getRounds(id).subscribe({
      next: (res) => {
        this.rounds = res.data;
      }
    });

    this.api.getLeaderboard().subscribe({
      next: (res) => {
        this.leaderboard = res.data;
      }
    });
  }

  relist(item: any) {
    this.error = '';

    this.api.relist(item.id, this.auth.user.id, item.newPrice).subscribe({
      next: () => {
        this.ngOnInit();
      },
      error: (err) => {
        this.error = err.error.error.message;
      }
    });
  }
}
