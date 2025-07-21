import axios from "axios";

export const baseAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_HOST,
});

export const heygenAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_HEYGEN_HOST,
});
