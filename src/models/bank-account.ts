import { failure, Result, success } from "../utils/type.utils";
import { FailureDetails } from "./failures";
import { Money } from "./money";
import { Transaction } from "./transaction";

export class BankAccount {
  private readonly transactions: Transaction[] = [];

  private constructor(
    public readonly accountId: string,
    public readonly initialAmount: Money,
  ) {}

  static create(accountId: string, money: Money): BankAccount {
    return new BankAccount(accountId, money);
  }

  balance() {
    return this.transactions.reduce((acc, transaction) => {
      if (transaction.type === "sent") return acc.subtract(transaction.amount);
      return acc.add(transaction.amount);
    }, this.initialAmount);
  }

  addTransaction(transaction: Transaction): Result<null, FailureDetails> {
    const balance = this.balance();
    const finalBal = balance.subtract(transaction.amount);
    if (transaction.type === "sent" && finalBal.amount < 0) {
      return failure({ reasonType: "NotEnoughBalance" });
    }
    this.transactions.push(transaction);
    return success(null);
  }
}
