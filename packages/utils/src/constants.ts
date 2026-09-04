export const BASEURL =
  process.env.NODE_ENV === "development"
    ? "http://192.168.1.7:8080"
    : "https://game-shelf-ssj1.onrender.com";

export const overviewLabels = [
  "Games",
  "DLCs",
  "Money Spent",
  "Hours Played",
  "Active Runs",
  "Completions",
];

export const GenericErrorMessage = "Something Went Wrong!";
