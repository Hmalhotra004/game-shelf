import { BASE_URL } from "@/lib/constants";
import axios from "axios";
import { authClient } from "./authClient";

export const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(async (config) => {
  const cookies = authClient.getCookie();

  if (cookies) {
    config.headers.Cookie = cookies;
  }

  return config;
});
