import { failure, Result, success } from '../utils/type.utils';
import { FailureDetails } from './failures';

export class StartBalance {

  private constructor(public readonly accountId: string, public readonly amount: number) {
  }

  static create(accountId: string, amount: number): Result<StartBalance, FailureDetails> {
    if (amount < 0) return failure({ reasonType: 'LessThanZero' })
    return success(new StartBalance(accountId, amount));
  }
}
