import { BankAccountService } from "./services/bank-account-service";
import { InMemoryBankAccountRepository } from "./repositories/in-memory-bank-account-repository";
import { createBatchFileProcessor } from "./batch-file-processor";

const repository = new InMemoryBankAccountRepository();
const service = new BankAccountService(repository);
const batchFileProcessor = createBatchFileProcessor(service);

const {
  failures: {
    transactionParsingFailures,
    transactionProcessingFailures,
    balanceParsingFailures,
    balanceCreationFailures,
  },
} = batchFileProcessor({
  balanceFile: "./test-data/mable_account_balances.csv",
  transactionsFile: "./test-data/mable_transactions.csv",
});

console.log("-----------Start Failures ------------------");
balanceParsingFailures.forEach((x) => {
  console.error("Balance parse failure", x);
});
transactionParsingFailures.forEach((x) => {
  console.error("Transaction parse failure", x);
});
balanceCreationFailures.forEach((x) => {
  console.error("Failed to create balance", x);
});
transactionProcessingFailures.forEach((x) => {
  console.error("Failed to create balance", x);
});
console.log("-----------End Failures ------------------");

console.log("---------- All account balances ---------");

service.getAllBalances().forEach((x) => {
  console.log(`Account Id ${x.accountId}, balance: ${x.balance.amount}`);
});
