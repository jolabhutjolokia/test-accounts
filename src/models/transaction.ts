import { Money } from "./money";

export class Transaction {
  private readonly createdAt: Date = new Date();

  constructor(
    public readonly type: "sent" | "received",
    private readonly otherAccountId: string,
    public readonly amount: Money,
  ) {}
}
