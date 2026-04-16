import { Money } from "../models/money";
import { IBankAccountRepository } from "../repositories/i-bank-account-repository";
import { Result } from "../utils/type.utils";
import { FailureDetails } from "../models/failures";
import { BankAccount } from "../models/bankAccount";
import { Transaction } from "../models/transaction";

export class BankAccountService {
  constructor(private readonly bankAccountRepository: IBankAccountRepository) {}

  createAccount(accountId: string, money: Money): Result<{}, FailureDetails> {
    const accountResult = BankAccount.create(accountId, money);
    if (accountResult.status === "failure") {
      return accountResult;
    }
    const createResult = this.bankAccountRepository.create(accountResult.data);
    if (createResult.status === "success") {
      return { status: "success", data: {} };
    }
    return createResult;
  }

  getBalance(
    accountId: string,
  ): Result<{ readonly amount: Money }, FailureDetails> {
    const getByAccountIdResult =
      this.bankAccountRepository.getByAccountId(accountId);
    if (getByAccountIdResult.status === "failure") {
      return getByAccountIdResult;
    }
    const bankAccount = getByAccountIdResult.data;
    return { status: "success", data: { amount: bankAccount.balance() } };
  }

  transfer(
    senderId: string,
    receiverId: string,
    amount: Money,
  ): Result<{}, FailureDetails> {
    const senderResult = this.bankAccountRepository.getByAccountId(senderId);
    if (senderResult.status === "failure") return senderResult;
    const receiverResult =
      this.bankAccountRepository.getByAccountId(receiverId);
    if (receiverResult.status === "failure") return receiverResult;

    const senderAccount = senderResult.data;
    senderAccount.addTransaction(new Transaction("sent", receiverId, amount));

    const receiverAccount = receiverResult.data;
    receiverAccount.addTransaction(
      new Transaction("received", senderId, amount),
    );

    this.bankAccountRepository.update(senderAccount);
    this.bankAccountRepository.update(receiverAccount);

    return { status: "success", data: {} };
  }
}
