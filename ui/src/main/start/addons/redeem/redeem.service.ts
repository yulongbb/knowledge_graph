import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RedeemService {
  private points: number = 100; // Example points

  getPoints(): number {
    return this.points;
  }

  generateKeywords(): string[] {
    return ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB'];
  }
}
