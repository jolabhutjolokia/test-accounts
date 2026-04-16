import fs from "fs";
import { FailureDetails } from "../../models/failures";
import { SuccessAndFailures } from "../../utils/success-and-failures";

export type ParsingBalanceFailureDetails = FailureDetails & {
  rowNumber: number;
};
export type ParsedBalance = { accountId: string; amount: number };

const createNotNumberFailure = (
  index: number,
): ParsingBalanceFailureDetails => ({
  rowNumber: index + 1,
  reasonType: "NotANumber",
  message: "Amount is not a number",
});

const isNotANumber = (amountAsStr: string) =>
  amountAsStr === "" || isNaN(Number(amountAsStr));

type ParsingResult = SuccessAndFailures<
  ParsedBalance,
  ParsingBalanceFailureDetails
>;

export const parseBalancesFile = (filePath: string): ParsingResult => {
  const rows = fs.readFileSync(filePath, "utf-8").split("\n");
  return rows.reduce<ParsingResult>((acc, row, index) => {
    if (row.trim() === "") return acc;
    const parts = row.split(",");
    const amountAsStr = parts[1];
    if (isNotANumber(amountAsStr)) {
      return acc.addFailure(createNotNumberFailure(index));
    }
    const amount = parseFloat(amountAsStr);
    return acc.addSuccess({ accountId: parts[0], amount: amount });
  }, new SuccessAndFailures());
};
