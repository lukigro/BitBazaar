import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-listing-detail',
  imports: [FormsModule],
  templateUrl: './listing-detail.html',
  styleUrl: './listing-detail.css'
})
export class ListingDetail implements OnInit {
  private api = inject(Api);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  auth = inject(Auth);

  listing: any = null;
  offers: any[] = [];
  offerPrice = 0;
  offerMessage = '';
  error = '';
  message = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.load(id);
  }

  load(id: number) {
    this.api.getListing(id).subscribe({
      next: (res) => {
        this.listing = res.data;
        this.loadOffers();
      }
    });
  }

  loadOffers() {
    this.api.getOffers(this.listing.id).subscribe({
      next: (res) => {
        this.offers = res.data;
      }
    });
  }

  isSeller() {
    return this.auth.isLoggedIn() && this.auth.user.id === this.listing.seller_id;
  }

  buy() {
    this.error = '';
    this.api.buyListing(this.listing.id, this.auth.user.id).subscribe({
      next: () => {
        this.refreshBalance();
        this.message = 'Gekauft!';
        this.load(this.listing.id);
      },
      error: (err) => {
        this.error = err.error.error.message;
      }
    });
  }

  makeOffer() {
    this.error = '';
    this.message = '';
    this.api
      .makeOffer(this.listing.id, this.auth.user.id, this.offerPrice, this.offerMessage)
      .subscribe({
        next: () => {
          this.message = 'Angebot gesendet.';
          this.offerPrice = 0;
          this.offerMessage = '';
          this.loadOffers();
        },
        error: (err) => {
          this.error = err.error.error.message;
        }
      });
  }

  accept(offer: any) {
    this.error = '';
    this.api.acceptOffer(offer.id).subscribe({
      next: () => {
        this.refreshBalance();
        this.message = 'Angebot angenommen.';
        this.load(this.listing.id);
      },
      error: (err) => {
        this.error = err.error.error.message;
      }
    });
  }

  reject(offer: any) {
    this.api.rejectOffer(offer.id).subscribe({
      next: () => {
        this.loadOffers();
      }
    });
  }

  remove() {
    this.api.deleteListing(this.listing.id).subscribe({
      next: () => {
        this.router.navigate(['/market']);
      }
    });
  }

  refreshBalance() {
    this.api.getUser(this.auth.user.id).subscribe({
      next: (res) => {
        this.auth.setBalance(res.data.balance);
      }
    });
  }
}
