import fs from "fs/promises";
import { FailureDetails } from "../../models/failures";
import { SuccessAndFailures } from "../../utils/success-and-failures";

type ParsingFailureDetails = FailureDetails & { rowNumber: number };
export type ParsedBalance = { accountId: string; amount: number };

const createNotNumberFailure = (index: number): ParsingFailureDetails => ({
  rowNumber: index + 1,
  reasonType: "NotANumber",
  message: "Amount is not a number",
});

const isNotANumber = (amountAsStr: string) =>
  amountAsStr === "" || isNaN(Number(amountAsStr));

type ParsingResult = SuccessAndFailures<ParsedBalance, ParsingFailureDetails>;
export const parseBalancesFile = async (
  filePath: string,
): Promise<ParsingResult> => {
  const rows = (await fs.readFile(filePath, "utf-8")).split("\n");

  return rows.reduce<ParsingResult>((acc, row, index) => {
    const parts = row.split(",");
    const amountAsStr = parts[1];
    if (isNotANumber(amountAsStr)) {
      return acc.addFailure(createNotNumberFailure(index));
    }
    const amount = parseFloat(amountAsStr);
    return acc.addSuccess({ accountId: parts[0], amount: amount });
  }, new SuccessAndFailures());
};
