/**
 * @file CancellationSlip.ts
 * OOP Class representing a processed ticket cancellation & refund audit slip
 */

export class CancellationSlip {
  private _bookingId: string;
  private _cancelledAt: string;
  private _cancellationFee: number;
  private _refundAmount: number;
  private _reason: string;
  private _refundReferenceId: string;

  constructor(
    bookingId: string,
    originalFare: number,
    reason: string = 'Passenger requested cancellation',
    hoursBeforeDeparture: number = 72
  ) {
    this._bookingId = bookingId;
    this._cancelledAt = new Date().toISOString();
    this._reason = reason;
    this._refundReferenceId = 'REF-' + Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Indian Railways standard cancellation slab rule (encapsulated domain logic)
    // > 48 hrs: Flat cancellation fee based on class (min ₹120 or 15%)
    // 12 to 48 hrs: 25% of fare subject to minimum
    // 4 to 12 hrs: 50% of fare
    // < 4 hrs: Non-refundable
    if (hoursBeforeDeparture >= 48) {
      this._cancellationFee = Math.min(originalFare, Math.max(120, Math.round(originalFare * 0.15)));
    } else if (hoursBeforeDeparture >= 12) {
      this._cancellationFee = Math.round(originalFare * 0.25);
    } else if (hoursBeforeDeparture >= 4) {
      this._cancellationFee = Math.round(originalFare * 0.5);
    } else {
      this._cancellationFee = originalFare;
    }

    this._refundAmount = Math.max(0, originalFare - this._cancellationFee);
  }

  public get bookingId(): string { return this._bookingId; }
  public get cancelledAt(): string { return this._cancelledAt; }
  public get cancellationFee(): number { return this._cancellationFee; }
  public get refundAmount(): number { return this._refundAmount; }
  public get reason(): string { return this._reason; }
  public get refundReferenceId(): string { return this._refundReferenceId; }

  public toJSON() {
    return {
      bookingId: this._bookingId,
      cancelledAt: this._cancelledAt,
      cancellationFee: this._cancellationFee,
      refundAmount: this._refundAmount,
      reason: this._reason,
      refundReferenceId: this._refundReferenceId,
    };
  }
}
