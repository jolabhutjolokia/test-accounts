import { BankAccount } from "../models/bankAccount";
import { FailureDetails } from "../models/failures";
import { Result } from "../utils/type.utils";
import { IBankAccountRepository } from "./i-bank-account-repository";

export class InMemoryBankAccountRepository implements IBankAccountRepository {
  private readonly accounts: Record<string, BankAccount> = {};

  create(account: BankAccount): Result<BankAccount, FailureDetails> {
    this.accounts[account.accountId] = account;
    return { status: "success", data: account };
  }

  getByAccountId(accountId: string): Result<BankAccount, FailureDetails> {
    const account = this.accounts[accountId];
    if (account == null)
      return {
        status: "failure",
        details: { reasonType: "AccountDoesNotExist", accountId },
      };
    return { status: "success", data: account };
  }

  update(account: BankAccount): void {
    this.accounts[account.accountId] = account;
  }
}
