export function removeNull<T>(object: T) {
  const res = { ...object };
  for (const key in res) if (res[key] === null) delete res[key];
  return res as {
    [K in keyof T as T[K] extends null ? never : K]: Exclude<T[K], null>;
  };
}
