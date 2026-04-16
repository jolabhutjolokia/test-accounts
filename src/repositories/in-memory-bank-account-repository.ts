import { BankAccount } from "../models/bank-account";
import { FailureDetails } from "../models/failures";
import { failure, Result, success } from "../utils/type.utils";
import { IBankAccountRepository } from "./i-bank-account-repository";

export class InMemoryBankAccountRepository implements IBankAccountRepository {
  private readonly accounts: Record<string, BankAccount> = {};

  create(account: BankAccount): Result<BankAccount, FailureDetails> {
    if (this.accounts[account.accountId] != null)
      return failure({ reasonType: "AccountAlreadyExists" });
    this.accounts[account.accountId] = account;
    return success(account);
  }

  getByAccountId(accountId: string): Result<BankAccount, FailureDetails> {
    const account = this.accounts[accountId];
    if (account == null)
      return {
        status: "failure",
        details: { reasonType: "AccountDoesNotExist", accountId },
      };
    return success(account);
  }

  update(account: BankAccount): void {
    this.accounts[account.accountId] = account;
  }

  getAllAccounts() {
    return Object.values(this.accounts);
  }
}
