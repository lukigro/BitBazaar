import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-roulette',
  imports: [FormsModule],
  templateUrl: './roulette.html',
  styleUrl: './roulette.css'
})
export class Roulette {
  private api = inject(Api);
  auth = inject(Auth);

  bet = 50;
  choice = 'red';
  numberChoice = 0;
  resultNumber = '-';
  resultColor = '';
  payout = 0;
  played = false;
  error = '';
  spinning = false;
  won = false;

  play() {
    this.error = '';
    this.played = false;
    this.won = false;
    this.spinning = true;

    let choice = this.choice;
    if (this.choice === 'number') {
      choice = String(this.numberChoice);
    }

    const flicker = setInterval(() => {
      this.resultNumber = String(Math.floor(Math.random() * 37));
    }, 70);

    this.api.play(this.auth.user.id, 'roulette', this.bet, choice).subscribe({
      next: (res) => {
        setTimeout(() => {
          clearInterval(flicker);
          const parts = res.data.result.split(',');
          this.resultNumber = parts[0];
          this.resultColor = parts[1];
          this.payout = res.data.payout;
          this.won = res.data.payout > 0;
          this.auth.setBalance(res.data.balance);
          this.played = true;
          this.spinning = false;
        }, 1100);
      },
      error: (err) => {
        clearInterval(flicker);
        this.resultNumber = '-';
        this.error = err.error.error.message;
        this.spinning = false;
      }
    });
  }
}
