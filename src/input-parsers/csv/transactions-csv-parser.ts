import fs from "fs";
import { FailureDetails } from "../../models/failures";
import { SuccessAndFailures } from "../../utils/success-and-failures";

type ParsingFailureDetails = FailureDetails & { rowNumber: number };
export type ParsedTransaction = { fromId: string; toId: string; amount: number; };

const createNotNumberFailure = (index: number): ParsingFailureDetails => ({
  rowNumber: index + 1,
  reasonType: "NotANumber",
  message: "Amount is not a number",
});

const isNotANumber = (amountAsStr: string) =>
  amountAsStr === "" || isNaN(Number(amountAsStr));

type ParsingResult = SuccessAndFailures<ParsedTransaction, ParsingFailureDetails>;

export const parseTransactionsFile = (
  filePath: string,
): ParsingResult => {
  const rows = fs.readFileSync(filePath, "utf-8").split("\n");
  return rows.reduce<ParsingResult>((acc, row, index) => {
    if (row.trim() === '') return acc;
    const [fromId, toId, amountAsStr] = row.split(",");
    if (isNotANumber(amountAsStr)) {
      return acc.addFailure(createNotNumberFailure(index));
    }
    const amount = parseFloat(amountAsStr);
    return acc.addSuccess({ fromId, toId, amount: amount });
  }, new SuccessAndFailures());
};
