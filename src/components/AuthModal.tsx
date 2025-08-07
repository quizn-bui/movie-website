import { useState } from "react";
import { User, X, Lock, Eye, EyeOff } from "lucide-react";
import "../styles/AuthModal.css";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) {
    return null;
  }

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-content">
        <button className="auth-modal-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
        <div className="auth-modal-header">
          <button className="auth-modal-register-btn">ĐĂNG KÝ NGAY</button>
        </div>
        <div className="auth-modal-body">
          <div className="input-group">
            <label htmlFor="username">Tài khoản</label>
            <div className="input-wrapper">
              <User size={20} className="input-icon" />
              <input
                type="text"
                id="username"
                placeholder="Nhập tài khoản"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <Lock size={20} className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <span className="password-toggle" onClick={toggleShowPassword}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </span>
            </div>
          </div>
          <a href="#" className="forgot-password">Quên mật khẩu?</a>
          <button className="auth-modal-login-btn">Đăng nhập</button>
          <div className="or-connect">hoặc kết nối tài khoản</div>
          <div className="social-login">
            <button className="social-btn google">
              <img src="https://img.icons8.com/color/48/000000/google-plus.png" alt="Google icon" />
            </button>
            <button className="social-btn other">
              <img src="https://img.icons8.com/ios-filled/50/000000/grid.png" alt="Other social icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}