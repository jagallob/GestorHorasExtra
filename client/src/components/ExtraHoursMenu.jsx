import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/useAuth";
import ChangePasswordModal from "../components/ChangePasswordModal/ChangePasswordModal";
import "./ExtraHoursMenu.scss";
import Agregar from "../assets/images/Agregar.png";
import Configuracion from "../assets/images/Configuracion.png";
import Gestion from "../assets/images/Gestion.png";
import Informes from "../assets/images/Informes.png";

const ExtraHoursMenu = () => {
  const navigate = useNavigate();
  const { auth, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  // Mostrar las opciones según el rol
  const renderMenuItems = () => {
    switch (auth?.role) {
      case "empleado":
        return (
          <>
            <div className="menu-item" onClick={() => navigate("/add")}>
              <img src={Agregar} alt="Agregar" />
              <p>Registrar Horas Extra</p>
            </div>
            <div className="menu-item" onClick={() => navigate("/reports")}>
              <img src={Informes} alt="Informes" />
              <p>Informes</p>
            </div>
          </>
        );

      case "manager":
        return (
          <>
            <div className="menu-item" onClick={() => navigate("/reports")}>
              <img src={Informes} alt="Informes" />
              <p>Informes</p>
            </div>
            <div
              className="menu-item"
              onClick={() => navigate("/ManagementExtraHour")}
            >
              <img src={Gestion} alt="Gestionar Horas Extra" />
              <p>Gestionar Horas Extra</p>
            </div>
          </>
        );

      case "superusuario":
        return (
          <>
            <div className="menu-item" onClick={() => navigate("/add")}>
              <div id="imgagregar">
                <img src={Agregar} alt="Agregar" />
              </div>
              <p>Registrar Horas Extra</p>
            </div>
            <div
              className="menu-item"
              onClick={() => navigate("/ManagementExtraHour")}
            >
              <img src={Gestion} alt="Gestion de horas" />
              <p>Gestionar Registro de Horas</p>
            </div>
            <div className="menu-item" onClick={() => navigate("/reports")}>
              <img src={Informes} alt="Informes" />
              <p>Informes</p>
            </div>
            <div className="menu-item" onClick={() => navigate("/settings")}>
              <img src={Configuracion} alt="Configuración" />
              <p>Configuración</p>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="menu">
        <h1>Sistema de Gestión de Horas Extra</h1>
        <div className="grid">{renderMenuItems()}</div>
        {/* <div className="button-container">
          <button className="logout-button" onClick={handleLogout}>
            Cerrar Sesión
          </button>
          <button className="change-password-button" onClick={openModal}>
            Cambiar Contraseña
          </button>
        </div> */}
        {isModalOpen && <ChangePasswordModal onClose={closeModal} />}
      </div>
    </div>
  );
};

export default ExtraHoursMenu;
