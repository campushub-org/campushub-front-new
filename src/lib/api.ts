import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer l'expiration du token (401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const path = window.location.pathname;
      const isGuestOnExplore =
        !localStorage.getItem("token") && path.startsWith("/explore");

      // Guest browsing /explore/* must not be pushed to /signin on a 401
      // (e.g. an endpoint not yet opened publicly). Just let the page handle it.
      if (isGuestOnExplore) {
        return Promise.reject(error);
      }

      // Le token est invalide ou expiré
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userProfileImage");

      // Redirection vers la page de login si on n'y est pas déjà
      if (!path.includes("/signin")) {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
