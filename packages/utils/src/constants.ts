export const BASEURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:8080"
    : "https://game-shelf-ssj1.onrender.com";

export const overviewLabels = [
  "Games",
  "DLCs",
  "Money Spent",
  "Hours Played",
  "Active Runs",
  "Completions",
];
