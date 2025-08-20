import { useState, useRef, useEffect, useContext } from "react";
import { Globe } from "lucide-react";
import { LanguageContext } from '../context/LanguageContext';
import "../styles/LanguageSelector.css";

interface LanguageSelectorProps {
  className?: string;
}

export default function LanguageSelector({ className }: LanguageSelectorProps) {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('LanguageSelector must be used within a LanguageProvider');
  }
  const { selectedLanguage, setSelectedLanguage, t } = context;

  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    setIsLanguageDropdownOpen(false);
  };

  return (
    <div
      className={`language-selector-container ${className}`}
      ref={languageDropdownRef}
      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
    >
      <Globe className="globe-icon" />
      <span className="language-display-name">
        {t(`${selectedLanguage}`)}
      </span>
      {isLanguageDropdownOpen && (
        <div className="language-dropdown">
          <div
            className="language-option"
            onClick={(e) => { e.stopPropagation(); handleLanguageChange("vi"); }}
          >
            {t('language_vietnamese')}
          </div>
          <div
            className="language-option"
            onClick={(e) => { e.stopPropagation(); handleLanguageChange("en"); }}
          >
            {t('language_english')}
          </div>
          <div
            className="language-option"
            onClick={(e) => { e.stopPropagation(); handleLanguageChange("zh"); }}
          >
            {t('language_chinese')}
          </div>
        </div>
      )}
    </div>
  );
}