import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../services/api';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-slots',
  imports: [FormsModule],
  templateUrl: './slots.html',
  styleUrl: './slots.css'
})
export class Slots {
  private api = inject(Api);
  auth = inject(Auth);

  bet = 50;
  reels: string[] = ['seven', 'seven', 'seven'];
  payout = 0;
  played = false;
  error = '';
  spinning = false;
  won = false;

  symbols: any = {
    cherry: '🍒',
    lemon: '🍋',
    bell: '🔔',
    star: '⭐',
    seven: '7️⃣'
  };

  names = ['cherry', 'lemon', 'bell', 'star', 'seven'];

  spin() {
    this.error = '';
    this.played = false;
    this.won = false;
    this.spinning = true;

    const flicker = setInterval(() => {
      this.reels = [this.randomSymbol(), this.randomSymbol(), this.randomSymbol()];
    }, 80);

    this.api.play(this.auth.user.id, 'slots', this.bet, '').subscribe({
      next: (res) => {

        setTimeout(() => {
          clearInterval(flicker);
          this.reels = res.data.result.split(',');
          this.payout = res.data.payout;
          this.won = res.data.payout > 0;
          this.auth.setBalance(res.data.balance);
          this.played = true;
          this.spinning = false;
        }, 900);
      },
      error: (err) => {
        clearInterval(flicker);
        this.reels = ['seven', 'seven', 'seven'];
        this.error = err.error.error.message;
        this.spinning = false;
      }
    });
  }

  randomSymbol() {
    return this.names[Math.floor(Math.random() * this.names.length)];
  }
}
