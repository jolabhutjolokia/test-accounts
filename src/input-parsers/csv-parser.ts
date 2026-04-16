import fs from "fs/promises";
import { Transaction } from '../models/transaction';
import { FailureDetails } from '../models/failures';
import { Money } from '../models/money';

type ParsingFailureDetails = FailureDetails & { rowNumber: number; };

class BalanceParsingResult {
  public readonly parsed: Transaction[] = [];
  public readonly failures: ParsingFailureDetails[] = [];

  addFailure(details: ParsingFailureDetails): BalanceParsingResult {
    this.failures.push(details);
    return this;
  }

  addParsed(data: Transaction): BalanceParsingResult {
    this.parsed.push(data);
    return this;
  }
}

const createNotNumberFailure = (index: number): ParsingFailureDetails => ({
  rowNumber: index + 1,
  reasonType: "NotANumber",
  message: 'Amount is not a number'
});

const isNotANumber = (amountAsStr: string) => amountAsStr === "" || isNaN(Number(amountAsStr));

export const parseBalancesFile = async (filePath: string): Promise<BalanceParsingResult> => {
  const rows = (await fs.readFile(filePath, "utf-8")).split('\n');
  return rows.reduce<BalanceParsingResult>((acc, row, index) => {
    const parts = row.split(',');
    const amountAsStr = parts[1];
    if (isNotANumber(amountAsStr)) return acc.addFailure(createNotNumberFailure(index));

    const moneyResult = Money.create(parseFloat(amountAsStr), 'AUD');
    if (moneyResult.status === 'failure') {
      return acc.addFailure({
        ...moneyResult.details,
        rowNumber: index + 1,
      });
    }
     
    const balanceResult = Transaction.create(parts[0], moneyResult.data);
    if (balanceResult.status === 'success') return acc.addParsed(balanceResult.data);
    return acc.addFailure({
      ...balanceResult.details,
      rowNumber: index + 1,
    });
  }, new BalanceParsingResult())
};
