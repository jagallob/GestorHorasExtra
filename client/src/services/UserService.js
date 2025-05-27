import { API_CONFIG } from "../environments/api.config";

// Configuración común para fetch
const fetchConfig = {
  baseConfig: {
    mode: "cors",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest", // Necesario para algunos servidores CORS
    },
  },
  getAuthHeader: () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  }),
};

// Manejo centralizado de errores
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || `Error ${response.status}: ${response.statusText}`
    );
    error.status = response.status;
    error.data = errorData;
    throw error;
  }
  return response.json();
};

export const UserService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        ...fetchConfig.baseConfig,
        method: "POST",
        body: JSON.stringify({ email, password }),
        // Headers específicos para login
        headers: {
          ...fetchConfig.baseConfig.headers,
          Origin: window.location.origin, // Ayuda con CORS
        },
      });

      const data = await handleResponse(response);

      // Almacenamiento seguro con verificación
      if (data.token && data.id && data.role) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("id", data.id);
        localStorage.setItem("role", data.role);
      } else {
        throw new Error("Respuesta de login incompleta");
      }

      return data;
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/change-password`,
        {
          ...fetchConfig.baseConfig,
          method: "PUT",
          headers: {
            ...fetchConfig.baseConfig.headers,
            ...fetchConfig.getAuthHeader(),
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error("Change password error details:", {
        message: error.message,
        status: error.status,
        data: error.data,
      });
      throw error;
    }
  },

  changePasswordAdmin: async (id, newPassword) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}/auth/change-password-admin`,
        {
          ...fetchConfig.baseConfig,
          method: "PUT",
          headers: {
            ...fetchConfig.baseConfig.headers,
            ...fetchConfig.getAuthHeader(),
          },
          body: JSON.stringify({ id, newPassword }),
        }
      );

      return await handleResponse(response);
    } catch (error) {
      console.error("Change password admin error details:", error);
      throw error;
    }
  },
};

export const logout = async () => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}/auth/logout`, {
      ...fetchConfig.baseConfig,
      method: "POST",
      headers: {
        ...fetchConfig.baseConfig.headers,
        ...fetchConfig.getAuthHeader(),
      },
    });

    // Limpieza segura
    ["token", "id", "role"].forEach((item) => localStorage.removeItem(item));

    return response.ok;
  } catch (error) {
    console.error("Logout error details:", error);
    throw error;
  }
};
