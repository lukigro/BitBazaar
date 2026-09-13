import { Routes } from '@angular/router';
import { Login } from './components/login/login';
import { Register } from './components/register/register';
import { Marketplace } from './components/marketplace/marketplace';
import { ListingDetail } from './components/listing-detail/listing-detail';
import { CreateListing } from './components/create-listing/create-listing';
import { Profile } from './components/profile/profile';
import { Slots } from './components/slots/slots';
import { Roulette } from './components/roulette/roulette';

export const routes: Routes = [
  { path: '', redirectTo: 'market', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'market', component: Marketplace },
  { path: 'market/:id', component: ListingDetail },
  { path: 'sell', component: CreateListing },
  { path: 'profile', component: Profile },
  { path: 'slots', component: Slots },
  { path: 'roulette', component: Roulette }
];
