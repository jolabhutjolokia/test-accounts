import { beforeEach, describe, expect, it, vi } from "vitest";
import fs from "fs/promises";
import { parseTransactionsFile } from './transactions-csv-parser';

vi.mock("fs/promises");

describe("parseBalancesFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should be able to parse a valid balances file", async () => {
    const rows = [
      '1111234522226789,1212343433335665,500.00',
      '3212343433335755,2222123433331212,1000.00'
    ];
    vi.spyOn(fs, "readFile").mockResolvedValue(rows.join("\n"));

    const result = await parseTransactionsFile("./test_balances.csv");

    expect(result).toEqual(
      expect.objectContaining({
        successes: [
          {
            fromId: '1111234522226789',
            toId: '1212343433335665',
            amount: 500.00,
          },
          {
            fromId: '3212343433335755',
            toId: '2222123433331212',
            amount: 1000.00,
          },
        ],
        failures: [],
      }),
    );
  });

  it("should return error for negative amounts", async () => {
    const rows = [
      '1111234522226789,1212343433335665,not_a_number',
      '3212343433335755,2222123433331212,1000.00'
    ];
    vi.spyOn(fs, "readFile").mockResolvedValue(rows.join("\n"));

    const result = await parseTransactionsFile("./test_balances.csv");

    expect(result).toEqual(
      expect.objectContaining({
        successes: [
          {
            fromId: '3212343433335755',
            toId: '2222123433331212',
            amount: 1000.00,
          },
        ],
        failures: [
          {
            reasonType: "NotANumber",
            rowNumber: 1,
            message: "Amount is not a number",
          },
        ],
      }),
    );
  });
});
