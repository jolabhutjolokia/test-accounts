import { beforeEach, describe, expect, it, vi } from "vitest";
import { parseBalancesFile } from "./balance-csv-parser";
import fs from "fs";

vi.mock("fs");

describe("parseBalancesFile", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should be able to parse a valid balances file", () => {
    const rows = [`1111234522226789,5000.00`, `1111234522221234,10000.00`];
    vi.spyOn(fs, "readFileSync").mockReturnValue(rows.join("\n"));

    const result = parseBalancesFile("./test_balances.csv");

    expect(result).toEqual(
      expect.objectContaining({
        successes: [
          {
            accountId: "1111234522226789",
            amount: 5000.0,
          },
          {
            accountId: "1111234522221234",
            amount: 10000.0,
          },
        ],
        failures: [],
      }),
    );
  });

  it("should return error for negative amounts", () => {
    const rows = [`1111234522226789,5000.00`, `1111234522221234,not_a_number`];
    vi.spyOn(fs, "readFileSync").mockReturnValue(rows.join("\n"));

    const result = parseBalancesFile("./test_balances.csv");

    expect(result).toEqual(
      expect.objectContaining({
        successes: [
          {
            accountId: "1111234522226789",
            amount: 5000.0,
          },
        ],
        failures: [
          {
            reasonType: "NotANumber",
            rowNumber: 2,
            message: "Amount is not a number",
          },
        ],
      }),
    );
  });

  it("should ignore empty lines", () => {
    const rows = [`1111234522226789,5000.00`, ""];
    vi.spyOn(fs, "readFileSync").mockReturnValue(rows.join("\n"));

    const result = parseBalancesFile("./test_balances.csv");

    expect(result).toEqual(
      expect.objectContaining({
        successes: [
          {
            accountId: "1111234522226789",
            amount: 5000.0,
          },
        ],
        failures: [],
      }),
    );
  });
});
