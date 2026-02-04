import axios from "axios";
import { BASEURL } from "../constants";

export const api = axios.create({
  baseURL: `${BASEURL}/api`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
