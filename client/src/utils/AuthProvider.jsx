import { useState } from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { API_CONFIG } from "../environments/api.config";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext"; // Importar el contexto desde su archivo

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [auth, setAuth] = useState(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const uniqueName = localStorage.getItem("unique_name");

    if (token && role) {
      const decodedToken = jwtDecode(token); // Decodificar el token
      console.log("Token decodificado:", decodedToken);

      // Almacenar el ID del usuario en localStorage si no está presente
      if (!localStorage.getItem("id")) {
        localStorage.setItem("id", decodedToken.id);
      }

      if (decodedToken.unique_name && !uniqueName) {
        localStorage.setItem("unique_name", decodedToken.unique_name);
      }

      return {
        token,
        role,
        uniqueName: uniqueName || decodedToken.unique_name,
      };
    }
    return null;
  });

  const login = async ({ email, password }) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // Importante para cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const data = await response.json();

      // Aquí debes procesar los datos de la respuesta
      if (data.token) {
        const decodedToken = jwtDecode(data.token);
        const formattedRole = decodedToken.role.replace(/[[\]]/g, "");

        // Almacenar en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", formattedRole);
        localStorage.setItem("id", decodedToken.id);

        if (decodedToken.unique_name) {
          localStorage.setItem("unique_name", decodedToken.unique_name);
        }

        // Actualizar el estado de autenticación
        setAuth({
          token: data.token,
          role: formattedRole,
          uniqueName: decodedToken.unique_name,
        });

        // Redirigir al usuario
        navigate("/menu");
      } else {
        throw new Error("No token received in response");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setAuth(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    localStorage.removeItem("unique_name");
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
