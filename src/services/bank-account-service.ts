import { Money } from "../models/money";
import { IBankAccountRepository } from "../repositories/i-bank-account-repository";
import { Result, success } from "../utils/type.utils";
import { FailureDetails } from "../models/failures";
import { BankAccount } from "../models/bank-account";
import { Transaction } from "../models/transaction";

export class BankAccountService {
  constructor(private readonly bankAccountRepository: IBankAccountRepository) {}

  createAccount(accountId: string, money: Money): Result<{}, FailureDetails> {
    const account = BankAccount.create(accountId, money);
    const createResult = this.bankAccountRepository.create(account);
    return createResult.status === "success" ? success({}) : createResult;
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
    return success({ amount: bankAccount.balance() });
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
    const sendTransactionResult = senderAccount.addTransaction(
      new Transaction("sent", receiverId, amount),
    );
    if (sendTransactionResult.status === "failure")
      return sendTransactionResult;

    const receiverAccount = receiverResult.data;
    receiverAccount.addTransaction(
      new Transaction("received", senderId, amount),
    );

    this.bankAccountRepository.update(senderAccount);
    this.bankAccountRepository.update(receiverAccount);

    return success({});
  }
}
