import { BASE_URL } from "@repo/utils/constants";
import axios from "axios";
import { authClient } from "./authClient";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const cookies = await authClient.getCookie();

  if (cookies) {
    config.headers.Cookie = cookies;
    config.headers["expo-origin"] = "game-shelf://";
  }

  return config;
});
