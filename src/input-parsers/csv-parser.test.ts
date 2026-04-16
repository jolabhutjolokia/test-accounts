import { beforeEach, describe, expect, it, vi } from 'vitest';
import { parseBalancesFile } from './csv-parser';
import fs from "fs/promises";

vi.mock("fs/promises");

describe("parseBalancesFile", () => {

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should be able to parse a valid balances file', async () => {
    const rows = [
      `1111234522226789,5000.00`,
      `1111234522221234,10000.00`
    ];
    vi.spyOn(fs, "readFile").mockResolvedValue(rows.join('\n'));

    const result = await parseBalancesFile('./test_balances.csv');

    expect(result).toEqual(expect.objectContaining({
      parsed: [
        {

          accountId: "1111234522226789",
          money: {
            amount: 5000.00,
            currency: "AUD",
          }
        }, {
          accountId: "1111234522221234",
          money: {
            amount: 10000.00,
            currency: "AUD",
          }
        }
      ],
      failures: []
    }));
  });

  it('should return error for negative amounts', async () => {
    const rows = [
      `1111234522226789,5000.00`,
      `1111234522221234,-10000.00`
    ];
    vi.spyOn(fs, "readFile").mockResolvedValue(rows.join('\n'));

    const result = await parseBalancesFile('./test_balances.csv');

    expect(result).toEqual(expect.objectContaining({
      parsed: [
        {
          accountId: "1111234522226789",
          money: {
            amount: 5000.00,
            currency: "AUD",
          }
        }
      ],
      failures: [{
        reasonType: 'LessThanZero',
        rowNumber: 2,
        message: "Amount cannot be less than 0"
      }]
    }));
  });

  it('should return error for non numeric amounts', async () => {
    const rows = [
      `1111234522221234,not_a_number`
    ];
    vi.spyOn(fs, "readFile").mockResolvedValue(rows.join('\n'));

    const result = await parseBalancesFile('./test_balances.csv');

    expect(result).toEqual(expect.objectContaining({
      parsed: [],
      failures: [{
        reasonType: 'NotANumber',
        rowNumber: 1,
        message: "Amount is not a number",
      }]
    }));
  });
});
