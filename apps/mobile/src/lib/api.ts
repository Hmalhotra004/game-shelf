import axios from "axios";
import { authClient } from "./authClient";

export const api = axios.create({
  baseURL: `http://192.168.0.103:8080/api`,
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
