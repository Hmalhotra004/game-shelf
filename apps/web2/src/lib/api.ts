import { BASEURL } from "@repo/utils/constants";
import axios from "axios";

export const api = axios.create({
  baseURL: `${BASEURL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
