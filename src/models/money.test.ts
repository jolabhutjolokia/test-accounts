import { describe, expect, it } from "vitest";
import { Money } from "./money";

describe("Money", () => {
  describe("create", () => {
    it("should return error if the amount is negative", () => {
      const result = Money.create(-100, "AUD");

      expect(result).toEqual({
        details: {
          message: "Amount cannot be less than 0",
          reasonType: "LessThanZero",
        },
        status: "failure",
      });
    });

    it("should be able to create valid money", () => {
      const result = Money.create(100, "AUD");

      expect(result).toEqual({
        data: {
          amount: 100,
          currency: "AUD",
        },
        status: "success",
      });
    });
  });
});
