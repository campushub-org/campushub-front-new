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
      // Le token est invalide ou expiré
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("userProfileImage");
      
      // Redirection vers la page de login si on n'y est pas déjà
      if (!window.location.pathname.includes("/signin")) {
        window.location.href = "/signin";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
