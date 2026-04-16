export class SuccessAndFailures<TSuccess, TFailure> {
  public readonly successes: TSuccess[] = [];
  public readonly failures: TFailure[] = [];

  addFailure(details: TFailure): SuccessAndFailures<TSuccess, TFailure> {
    this.failures.push(details);
    return this;
  }

  addSuccess(data: TSuccess): SuccessAndFailures<TSuccess, TFailure> {
    this.successes.push(data);
    return this;
  }
}
