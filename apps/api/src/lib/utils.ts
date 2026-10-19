export const normalize = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]/g, "");
