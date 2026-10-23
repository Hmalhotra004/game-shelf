import axios from "axios";
import { router } from "expo-router";
import { authClient } from "./authClient";
import { BASE_URL } from "./utils";

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

let signingOut = false;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !signingOut) {
      signingOut = true;
      try {
        await authClient.signOut();
      } catch {
        // session is already invalid server-side; ignore
      } finally {
        signingOut = false;
        router.replace({ pathname: "/(auth)" });
      }
    }
    return Promise.reject(error);
  },
);
