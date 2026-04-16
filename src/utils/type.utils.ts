export type Success<TData> = { status: "success"; data: TData };

export type Failure<TDetails> = {
  status: "failure";
  details: TDetails;
};

export type Result<TSuccess, TFailure> = Success<TSuccess> | Failure<TFailure>;

export const success = <T>(data: T): Success<T> => ({
  status: "success",
  data,
});
export const failure = <T>(details: T): Failure<T> => ({
  status: "failure",
  details,
});
