import axios from "axios";

export const steamClient = axios.create({
  baseURL: "https://api.steampowered.com",
  timeout: 10_000,
});
