export function just<T>(x: T | undefined): Array<T> {
  return x === undefined ? [] : [x];
}
