import fs from "fs/promises";
import { StartBalance } from '../models/start-balance';
import { FailureDetails } from '../models/failures';

type BalanceParsingResult = {
  parsed: StartBalance[];
  failures: (FailureDetails & { rowNumber: number; })[];
};

export const parseBalancesFile = async (filePath: string): Promise<BalanceParsingResult> => {
  const rows = (await fs.readFile(filePath, "utf-8")).split('\n');
  return rows.reduce<BalanceParsingResult>((acc, row, index) => {
    const parts = row.split(',');

    const result = StartBalance.create(parts[0], parseFloat(parts[1]));

    if (result.status === 'success') {
      acc.parsed.push(result.data);
    } else {
      acc.failures.push({
        ...result.details,
        rowNumber: index + 1
      });
    }
    return acc;
  }, { parsed: [], failures: [] })
};
