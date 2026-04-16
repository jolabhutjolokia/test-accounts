import { BankAccountService } from "./services/bank-account-service";
import {
  parseBalancesFile,
  ParsedBalance,
} from "./input-parsers/csv/balance-csv-parser";
import {
  ParsedTransaction,
  parseTransactionsFile,
} from "./input-parsers/csv/transactions-csv-parser";
import { Money } from "./models/money";
import { FailureDetails } from "./models/failures";

function createInitialBalances(
  balances: ParsedBalance[],
  service: BankAccountService,
) {
  return balances.reduce<FailureDetails[]>((acc, balance) => {
    const amountResult = Money.create(balance.amount, "AUD");
    if (amountResult.status === "failure") {
      acc.push(amountResult.details);
      return acc;
    }

    const createResult = service.createAccount(
      balance.accountId,
      amountResult.data,
    );
    if (createResult.status === "success") return acc;

    acc.push(createResult.details);
    return acc;
  }, []);
}

function processAllTransactions(
  transactions: ParsedTransaction[],
  service: BankAccountService,
) {
  return transactions.reduce<FailureDetails[]>((acc, transaction) => {
    const amountResult = Money.create(transaction.amount, "AUD");
    if (amountResult.status === "failure") {
      acc.push(amountResult.details);
      return acc;
    }

    const transferResult = service.transfer(
      transaction.fromId,
      transaction.toId,
      amountResult.data,
    );
    if (transferResult.status === "failure") {
      acc.push(transferResult.details);
    }
    return acc;
  }, []);
}

type ProcessResult = {
  failures: {
    balanceParsingFailures: FailureDetails[];
    transactionParsingFailures: FailureDetails[];
    balanceCreationFailures: FailureDetails[];
    transactionProcessingFailures: FailureDetails[];
  };
};

export const createBatchFileProcessor =
  (service: BankAccountService) =>
  (args: { balanceFile: string; transactionsFile: string }): ProcessResult => {
    const balances = parseBalancesFile(args.balanceFile);
    const transactions = parseTransactionsFile(args.transactionsFile);
    const balanceCreationFailures = createInitialBalances(
      balances.successes,
      service,
    );
    const transactionProcessingFailures = processAllTransactions(
      transactions.successes,
      service,
    );

    return {
      failures: {
        balanceParsingFailures: balances.failures,
        transactionParsingFailures: transactions.failures,
        balanceCreationFailures,
        transactionProcessingFailures,
      },
    };
  };
