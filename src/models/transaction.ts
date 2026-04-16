import { Result, success } from "../utils/type.utils";
import { FailureDetails } from "./failures";
import { Money } from "./money";

export class Transaction {
  private constructor(
    public readonly accountId: string,
    public readonly money: Money,
  ) {}

  static create(
    accountId: string,
    money: Money,
  ): Result<Transaction, FailureDetails> {
    return success(new Transaction(accountId, money));
  }
}
