import { Money } from "../models/money";
import { IBankAccountRepository } from "../repositories/i-bank-account-repository";
import { Result, success } from "../utils/type.utils";
import { FailureDetails } from "../models/failures";
import { BankAccount } from "../models/bank-account";

export class BankAccountService {
  constructor(private readonly accountRepository: IBankAccountRepository) {}

  createAccount(accountId: string, money: Money): Result<null, FailureDetails> {
    const account = BankAccount.create(accountId, money);
    const createResult = this.accountRepository.create(account);
    return createResult.status === "success" ? success(null) : createResult;
  }

  getBalance(
    accountId: string,
  ): Result<{ readonly amount: Money }, FailureDetails> {
    const getByAccountIdResult =
      this.accountRepository.getByAccountId(accountId);
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
  ): Result<null, FailureDetails> {
    const senderResult = this.accountRepository.getByAccountId(senderId);
    if (senderResult.status === "failure") return senderResult;
    const receiverResult = this.accountRepository.getByAccountId(receiverId);
    if (receiverResult.status === "failure") return receiverResult;

    const senderAccount = senderResult.data;
    const sendTransactionResult = senderAccount.send(receiverId, amount);
    if (sendTransactionResult.status === "failure")
      return sendTransactionResult;

    const receiverAccount = receiverResult.data;
    receiverAccount.receive(senderId, amount);

    this.accountRepository.update(senderAccount);
    this.accountRepository.update(receiverAccount);

    return success(null);
  }

  getAllBalances() {
    return this.accountRepository.getAllAccounts().map((x) => {
      return {
        accountId: x.accountId,
        balance: x.balance(),
      };
    });
  }
}
