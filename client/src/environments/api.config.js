export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === "production"
      ? "http://backend:8080" // Docker Compose
      : "http://localhost:80"), // Desarrollo local
};
