export {};

declare global {
  var pgPool: import("pg").Pool | undefined;
}
