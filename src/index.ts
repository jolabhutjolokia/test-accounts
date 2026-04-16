import { BankAccountService } from './services/bank-account-service';
import { InMemoryBankAccountRepository } from './repositories/in-memory-bank-account-repository';
import { parseBalancesFile } from './input-parsers/csv/balance-csv-parser';
import { parseTransactionsFile } from './input-parsers/csv/transactions-csv-parser';
import { Money } from './models/money';

const balances = parseBalancesFile("./test-data/mable_account_balances.csv");
const transactions = parseTransactionsFile('./test-data/mable_transactions.csv');
const repository = new InMemoryBankAccountRepository();
const service = new BankAccountService(repository);

console.log("-----------Start Parsing Failures ------------------");
balances.failures.forEach((x) => {
  console.error("Balance parse failure", x);
})
transactions.failures.forEach((x) => {
  console.error("Transaction parse failure", x);
})
console.log("-----------End Parsing Failures ------------------");


balances.successes.forEach((balance) => {
  const amountResult = Money.create(balance.amount, "AUD");
  if (amountResult.status === 'failure') {
    console.error("Balance amount is invalid", amountResult.details);
    return;
  }
  const createResult = service.createAccount(balance.accountId, amountResult.data);
  if (createResult.status === 'failure') {
    console.error("Could not create account", createResult.details)
  }
});

transactions.successes.forEach((transaction) => {
  const amountResult = Money.create(transaction.amount, "AUD");
  if (amountResult.status === 'failure') {
    console.error("Transfer amount is invalid", amountResult.details);
    return;
  }
  const transferResult = service.transfer(transaction.fromId, transaction.toId, amountResult.data);
  if (transferResult.status === 'failure') {
    console.error("Failed to transfer", transferResult.details)
  }
})

console.log("---------- all account balances ---------");

service.getAllBalances().forEach((x) => {
  console.log(`Account Id ${ x.accountId }, balance: ${ x.balance.amount }`);
});








