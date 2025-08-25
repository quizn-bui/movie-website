// File: AuthModal.tsx

import { useState, useContext } from "react";
import { User, X, Lock, Eye, EyeOff } from "lucide-react";
import { LanguageContext } from "../context/LanguageContext";
import "../styles/AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  // CHỈNH SỬA DÒNG NÀY: Thêm "| null" để chấp nhận null
  authModalRef: React.RefObject<HTMLDivElement> | null;
}

export default function AuthModal({ isOpen, onClose, authModalRef }: AuthModalProps) {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("AuthModal must be used within a LanguageProvider");
  }
  const { t } = context;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) {
    return null;
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };
  
  const handleToggleMode = () => {
    setIsRegisterMode(!isRegisterMode);
    setErrorMessage("");
  };

  const handleLogin = () => {
    if (username.trim() === "" || password.trim() === "") {
      setErrorMessage(t("empty_fields_error"));
    } else {
      setErrorMessage("");
      console.log("Đăng nhập thành công với:", { username, password });
    }
  };

  const handleRegister = () => {
    setErrorMessage(t("registration_not_implemented"));
  };

  return (
    <div className="auth-modal__overlay">
      <div className="auth-modal__content" ref={authModalRef}>
        <button className="auth-modal__close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="auth-modal__header">
          <button className="auth-modal__register-btn" onClick={handleToggleMode}>
            {isRegisterMode ? t("login_button") : t("register_button")}
          </button>
        </div>
        <div className="auth-modal__body">
          <div className="auth-modal__input-group">
            <label htmlFor="username" className="auth-modal__label">{t("username_label")}</label>
            <div className="auth-modal__input-wrapper">
              <User size={20} className="auth-modal__input-icon" />
              <input
                type="text"
                id="username"
                placeholder={t("username_placeholder")}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="auth-modal__input"
              />
            </div>
          </div>
          <div className="auth-modal__input-group">
            <label htmlFor="password" className="auth-modal__label">{t("password_label")}</label>
            <div className="auth-modal__input-wrapper">
              <Lock size={20} className="auth-modal__input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder={t("password_placeholder")}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="auth-modal__input"
              />
              <span className="auth-modal__password-toggle" onClick={toggleShowPassword}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>
          {isRegisterMode && (
            <div className="auth-modal__input-group">
              <label htmlFor="confirmPassword" className="auth-modal__label">{t("confirm_password_label")}</label>
              <div className="auth-modal__input-wrapper">
                <Lock size={20} className="auth-modal__input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder={t("confirm_password_placeholder")}
                  className="auth-modal__input"
                />
              </div>
            </div>
          )}
          {!isRegisterMode && (
            <a href="#" className="auth-modal__forgot-password">{t("forgot_password_link")}</a>
          )}
          {errorMessage && <p className="auth-modal__error-message">{errorMessage}</p>}
          <button 
            className="auth-modal__login-btn"
            onClick={isRegisterMode ? handleRegister : handleLogin}
          >
            {isRegisterMode ? t("register_button") : t("login_button")}
          </button>
          <div className="auth-modal__or-connect">{t("or_connect_text")}</div>
          <div className="auth-modal__social-login">
            <button className="auth-modal__social-btn auth-modal__social-btn--google">
              <img src="https://img.icons8.com/color/48/000000/google-plus.png" alt="Google icon" />
            </button>
            <button className="auth-modal__social-btn auth-modal__social-btn--other">
              <img src="https://img.icons8.com/ios-filled/50/000000/grid.png" alt="Other social icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}