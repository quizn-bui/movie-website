import { useContext } from "react";
import "../styles/Footer.css";
import { LanguageContext } from "../context/LanguageContext";

export default function Footer() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("Footer must be used within a LanguageProvider");
  }
  const { t } = context;

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <a href="/" className="logo-link">
          <h1 className="footer-logo">MoviX</h1>
        </a>
        <p className="footer-description">
          {t("footer_description")}
        </p>

        <p className="footer-copyright">
          © {new Date().getFullYear()} MoviX
        </p>
      </div>
    </footer>
  );
}