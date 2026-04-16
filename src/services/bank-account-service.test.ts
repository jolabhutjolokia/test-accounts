import { beforeEach, describe, expect, it } from "vitest";
import { BankAccountService } from "./bank-account-service";
import { InMemoryBankAccountRepository } from "../repositories/in-memory-bank-account.repository";
import { Money } from "../models/money";
import { Success } from "../utils/type.utils";

describe("BankAccountService", () => {
  let bankingService: BankAccountService;

  beforeEach(() => {
    bankingService = new BankAccountService(
      new InMemoryBankAccountRepository(),
    );
  });

  describe("initial balance", () => {
    it("should be able to create account with initial balance", () => {
      const amount = (Money.create(100.0, "AUD") as Success<Money>).data;
      const accountId = "213213";

      bankingService.createAccount(accountId, amount);
      const balance1 = bankingService.getBalance(accountId);

      expect(balance1).toEqual({
        data: {
          amount: {
            amount: 100.0,
            currency: "AUD",
          },
        },
        status: "success",
      });
    });
  });

  describe("on going transactions", () => {
    const senderBalance = (Money.create(100.0, "AUD") as Success<Money>).data;
    const senderId = "213213";
    const receiverBalance = (Money.create(300.0, "AUD") as Success<Money>).data;
    const receiverId = "567657";

    describe("sender has balance and receiver exists", () => {
      beforeEach(() => {
        bankingService.createAccount(senderId, senderBalance);
        bankingService.createAccount(receiverId, receiverBalance);
      });

      it("should allow transferring money to another account", () => {
        const transferAmount = (Money.create(50.0, "AUD") as Success<Money>)
          .data;

        const result = bankingService.transfer(
          senderId,
          receiverId,
          transferAmount,
        );

        expect(result.status).toEqual("success");
      });

      it("should deduct the correct amount from the sender", () => {
        const transferAmount = (Money.create(50.0, "AUD") as Success<Money>)
          .data;

        bankingService.transfer(senderId, receiverId, transferAmount);

        const balanceResult = bankingService.getBalance(senderId);
        expect(balanceResult).toEqual({
          data: {
            amount: {
              amount: 50.0,
              currency: "AUD",
            },
          },
          status: "success",
        });
      });

      it("should credit the correct amount from the receiver", () => {
        const transferAmount = (Money.create(50.0, "AUD") as Success<Money>)
          .data;

        bankingService.transfer(senderId, receiverId, transferAmount);

        const balanceResult = bankingService.getBalance(receiverId);
        expect(balanceResult).toEqual({
          data: {
            amount: {
              amount: 350.0,
              currency: "AUD",
            },
          },
          status: "success",
        });
      });
    });

    describe("error scenarios", () => {
      it("if sender does not exist should return an error while transferring", () => {
        const transferAmount = (Money.create(50.0, "AUD") as Success<Money>)
          .data;

        const result = bankingService.transfer(
          "unknown_sender",
          receiverId,
          transferAmount,
        );

        expect(result).toEqual({
          status: "failure",
          details: {
            reasonType: "AccountDoesNotExist",
            accountId: "unknown_sender",
          },
        });
      });
    });
  });
});
