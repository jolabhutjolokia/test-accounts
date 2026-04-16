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

  private addTransaction(
    transaction: Transaction,
  ): Result<null, FailureDetails> {
    if (
      transaction.type === "sent" &&
      this.wouldBalanceBeNegative(transaction)
    ) {
      return failure({ reasonType: "NotEnoughBalance" });
    }
    this.transactions.push(transaction);
    return success(null);
  }

  private wouldBalanceBeNegative(transaction: Transaction) {
    const finalBal = this.balance().subtract(transaction.amount);
    return finalBal.amount < 0;
  }

  send(otherAccountId: string, amount: Money) {
    return this.addTransaction(new Transaction("sent", otherAccountId, amount));
  }

  receive(otherAccountId: string, amount: Money) {
    return this.addTransaction(
      new Transaction("received", otherAccountId, amount),
    );
  }
}
