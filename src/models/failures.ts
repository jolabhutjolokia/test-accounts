export type FailureDetails = Readonly<
  | {
      reasonType: "LessThanZero" | "NotANumber";
      message: string;
    }
  | { reasonType: "AccountDoesNotExist"; accountId: string }
>;
