export function formAction<T>(fn: (data: FormData) => Promise<T>) {
  return fn as (data: FormData) => Promise<void>;
}
