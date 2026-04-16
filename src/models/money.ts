import { failure, Result, success } from '../utils/type.utils';
import { FailureDetails } from './failures';

export type Currency = "AUD";

export class Money {

  private constructor(public readonly amount: number, public readonly currency: Currency) {
  }

  static create(amount: number, currency: Currency): Result<Money, FailureDetails> {
    if (amount < 0) return failure({ reasonType: 'LessThanZero', message: 'Amount cannot be less than 0' })
    return success(new Money(amount, currency));
  }
}
