/* 降低代码的重解 */
interface Defer {
  <T>(): {
    resolve: (val: T) => void;
    reject: () => void;
    promise: Promise<T>;
  };
}
export const defer: Defer = () => {
  const dfd = {} as any;
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve;
    dfd.reject = reject;
  })
  return dfd;
}