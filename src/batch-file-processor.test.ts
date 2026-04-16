import { beforeEach, describe, vi, it, expect } from "vitest";
import { createBatchFileProcessor } from "./batch-file-processor";
import { BankAccountService } from "./services/bank-account-service";
import { InMemoryBankAccountRepository } from "./repositories/in-memory-bank-account-repository";
import * as balanceParse from "./input-parsers/csv/balance-csv-parser";
import * as transactionParse from "./input-parsers/csv/transactions-csv-parser";
import { SuccessAndFailures } from "./utils/success-and-failures";
import {
  ParsedBalance,
  ParsingBalanceFailureDetails,
} from "./input-parsers/csv/balance-csv-parser";
import {
  ParsedTransaction,
  ParsingTransactionFailureDetails,
} from "./input-parsers/csv/transactions-csv-parser";

vi.mock("./input-parsers/csv/balance-csv-parser");
vi.mock("./input-parsers/csv/transactions-csv-parser");

describe("createBatchFileProcessor", () => {
  let fileProcessor: ReturnType<typeof createBatchFileProcessor>;
  let bankAccountService: BankAccountService;

  beforeEach(() => {
    bankAccountService = new BankAccountService(
      new InMemoryBankAccountRepository(),
    );
    fileProcessor = createBatchFileProcessor(bankAccountService);
  });

  describe("for happy path with no failures", () => {
    const balanceParseResult = new SuccessAndFailures<
      ParsedBalance,
      ParsingBalanceFailureDetails
    >([
      { accountId: "1111234522226789", amount: 5000.0 },
      { accountId: "1111234522221234", amount: 10000.0 },
      { accountId: "2222123433331212", amount: 550.0 },
      { accountId: "1212343433335665", amount: 1200.0 },
      { accountId: "3212343433335755", amount: 50000.0 },
    ]);

    const transactionParseResult = new SuccessAndFailures<
      ParsedTransaction,
      ParsingTransactionFailureDetails
    >([
      { fromId: "1111234522226789", toId: "1212343433335665", amount: 500.0 },
      { fromId: "3212343433335755", toId: "2222123433331212", amount: 1000.0 },
      { fromId: "3212343433335755", toId: "1111234522226789", amount: 320.5 },
      { fromId: "1111234522221234", toId: "1212343433335665", amount: 25.6 },
    ]);

    it("should not have any failures", () => {
      vi.spyOn(balanceParse, "parseBalancesFile").mockReturnValue(
        balanceParseResult,
      );
      vi.spyOn(transactionParse, "parseTransactionsFile").mockReturnValue(
        transactionParseResult,
      );

      const result = fileProcessor({
        balanceFile: "dummy_bal.csv",
        transactionsFile: "dummy_transaction.csv",
      });

      expect(result.failures.balanceCreationFailures).toHaveLength(0);
      expect(result.failures.balanceParsingFailures).toHaveLength(0);
      expect(result.failures.transactionProcessingFailures).toHaveLength(0);
      expect(result.failures.transactionParsingFailures).toHaveLength(0);
    });

    it("should have correct totals", () => {
      vi.spyOn(balanceParse, "parseBalancesFile").mockReturnValue(
        balanceParseResult,
      );
      vi.spyOn(transactionParse, "parseTransactionsFile").mockReturnValue(
        transactionParseResult,
      );

      fileProcessor({
        balanceFile: "dummy_bal.csv",
        transactionsFile: "dummy_transaction.csv",
      });

      expect(bankAccountService.getAllBalances()).toEqual([
        {
          accountId: "1111234522226789",
          balance: {
            amount: 4820.5,
            currency: "AUD",
          },
        },
        {
          accountId: "1111234522221234",
          balance: {
            amount: 9974.4,
            currency: "AUD",
          },
        },
        {
          accountId: "2222123433331212",
          balance: {
            amount: 1550.0,
            currency: "AUD",
          },
        },
        {
          accountId: "1212343433335665",
          balance: {
            amount: 1725.6,
            currency: "AUD",
          },
        },
        {
          accountId: "3212343433335755",
          balance: {
            amount: 48679.5,
            currency: "AUD",
          },
        },
      ]);
    });
  });
});
