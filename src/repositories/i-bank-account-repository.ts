import { Result } from "../utils/type.utils";
import { BankAccount } from "../models/bankAccount";
import { FailureDetails } from "../models/failures";

export interface IBankAccountRepository {
  create(data: BankAccount): Result<BankAccount, FailureDetails>;

  getByAccountId(accountId: string): Result<BankAccount, FailureDetails>;

  update(senderAccount: BankAccount): void;
}
