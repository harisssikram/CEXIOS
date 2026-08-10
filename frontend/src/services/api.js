import axios from "axios";
import pinSession from "./pinSession";

// Backend is untouched -- same base URL and routes as before.
const baseURL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cexios_admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const pinToken = pinSession.getValidToken();
  if (pinToken) {
    config.headers["X-Pin-Token"] = pinToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const detail = error.response?.data?.detail || "";
      if (detail.toLowerCase().includes("pin")) {
        // Expired/incorrect PIN -- drop the stale session so the next attempt re-prompts.
        pinSession.lock();
      } else {
        localStorage.removeItem("cexios_admin_token");
      }
    }
    return Promise.reject(error);
  }
);

export default api;
