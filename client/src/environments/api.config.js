export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.MODE === "production"
      ? "https://extrahours-api-f0axe3bmakgph9c9.eastus2-01.azurewebsites.net" // Azure
      : "http://localhost:80"), // Desarrollo local
};
