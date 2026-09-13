import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

const URL = 'http://localhost:3000/api';

@Injectable({
  providedIn: 'root'
})
export class Api {
  private http = inject(HttpClient);

  register(username: string, password: string) {
    return this.http.post<any>(URL + '/users', { username: username, password: password });
  }

  login(username: string, password: string) {
    return this.http.post<any>(URL + '/sessions', { username: username, password: password });
  }

  getUser(id: number) {
    return this.http.get<any>(URL + '/users/' + id);
  }

  getLeaderboard() {
    return this.http.get<any>(URL + '/users');
  }

  getTransactions(userId: number) {
    return this.http.get<any>(URL + '/users/' + userId + '/transactions');
  }

  getRounds(userId: number) {
    return this.http.get<any>(URL + '/users/' + userId + '/rounds');
  }

  getMyOffers(userId: number) {
    return this.http.get<any>(URL + '/users/' + userId + '/offers');
  }

  getListings(search: string) {
    return this.http.get<any>(URL + '/listings?search=' + search);
  }

  getListing(id: number) {
    return this.http.get<any>(URL + '/listings/' + id);
  }

  getInventory(userId: number) {
    return this.http.get<any>(URL + '/users/' + userId + '/inventory');
  }

  relist(listingId: number, ownerId: number, price: number) {
    return this.http.post<any>(URL + '/listings/' + listingId + '/relist', {
      ownerId: ownerId,
      price: price
    });
  }

  getMyListings(userId: number) {
    return this.http.get<any>(URL + '/listings/seller/' + userId);
  }

  createListing(sellerId: number, title: string, description: string, price: number, image: string) {
    return this.http.post<any>(URL + '/listings', {
      sellerId: sellerId,
      title: title,
      description: description,
      price: price,
      image: image
    });
  }

  deleteListing(id: number) {
    return this.http.delete<any>(URL + '/listings/' + id);
  }

  buyListing(listingId: number, buyerId: number) {
    return this.http.post<any>(URL + '/listings/' + listingId + '/purchase', { buyerId: buyerId });
  }

  getOffers(listingId: number) {
    return this.http.get<any>(URL + '/listings/' + listingId + '/offers');
  }

  makeOffer(listingId: number, buyerId: number, price: number, message: string) {
    return this.http.post<any>(URL + '/listings/' + listingId + '/offers', {
      buyerId: buyerId,
      price: price,
      message: message
    });
  }

  acceptOffer(offerId: number) {
    return this.http.post<any>(URL + '/offers/' + offerId + '/accept', {});
  }

  rejectOffer(offerId: number) {
    return this.http.post<any>(URL + '/offers/' + offerId + '/reject', {});
  }

  play(userId: number, game: string, bet: number, choice: string) {
    return this.http.post<any>(URL + '/rounds', {
      userId: userId,
      game: game,
      bet: bet,
      choice: choice
    });
  }
}
