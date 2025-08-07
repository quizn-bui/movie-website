    import { useState, useRef, useEffect } from "react";
import { Globe } from "lucide-react";
import "../styles/LanguageSelector.css"; 

export default function LanguageSelector() {
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || "vi";
  });
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
    localStorage.setItem("appLanguage", lang);
    setIsLanguageDropdownOpen(false);
  };

  const handleLanguageClick = (e: React.MouseEvent, lang: string) => {
    e.stopPropagation();
    handleLanguageChange(lang);
  };

  const getLanguageDisplayName = (langCode: string) => {
    switch (langCode) {
      case "vi":
        return "Tiếng Việt";
      case "en":
        return "English";
      case "zh":
        return "简体中文";
      default:
        return "Language";
    }
  };

  return (
    <div
      className="web-language"
      ref={languageDropdownRef}
      onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
    >
      <Globe className="globe-icon" />
      <span className="language-display-name">
        {getLanguageDisplayName(selectedLanguage)}
      </span>
      {isLanguageDropdownOpen && (
        <div className="language-dropdown">
          <div
            className="language-option"
            onClick={(e) => handleLanguageClick(e, "vi")}
          >
            Tiếng Việt
          </div>
          <div
            className="language-option"
            onClick={(e) => handleLanguageClick(e, "en")}
          >
            English
          </div>
          <div
            className="language-option"
            onClick={(e) => handleLanguageClick(e, "zh")}
          >
            简体中文
          </div>
        </div>
      )}
    </div>
  );
}