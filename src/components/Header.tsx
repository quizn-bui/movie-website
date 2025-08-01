import { useState, useEffect, useRef } from "react";
import { Search, Menu, X, Globe, User } from "lucide-react";
import "../styles/Header.css";
import DesktopNavigation from "./DesktopNavigation"; 

interface MovieSearchResult {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || "vi";
  });
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const languageDropdownRef = useRef<HTMLDivElement>(null);
  const authModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const debounceTimer = setTimeout(() => {
      fetchSearchResults(searchQuery, selectedLanguage);
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedLanguage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
      if (
        authModalRef.current &&
        !authModalRef.current.contains(event.target as Node) &&
        isAuthModalOpen
      ) {
        const userActionsButton = document.querySelector('.user-actions');
        if (userActionsButton && userActionsButton.contains(event.target as Node)) {
            return;
        }
        setIsAuthModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAuthModalOpen]); 

  const fetchSearchResults = async (query: string, languageCode: string) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

    if (!API_KEY || !BASE_URL) return;

    const apiLanguageCode = {
      vi: "vi-VN",
      en: "en-US",
      zh: "zh-CN",
    }[languageCode];

    try {
      const response = await fetch(
        `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&language=${apiLanguageCode}&page=1`
      );
      const data = await response.json();
      setSearchResults(data.results.slice(0, 5));
    } catch (error) {
      console.error("Error fetching search results:", error);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    localStorage.setItem("appLanguage", lang);
    setIsLanguageDropdownOpen(false);
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

  const toggleAuthModal = () => {
    setIsAuthModalOpen(!isAuthModalOpen);
  };

  return (
    <header className={`header ${isScrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="header-content">
          <div className="logo-section">
            <a href="/" className="logo-link">
              <h1 className="logo">MoviX</h1>
            </a>
          </div>

          <DesktopNavigation
            currentPath={window.location.pathname} 
            selectedLanguage={selectedLanguage} 
          />

          <div className="search-container" ref={searchContainerRef}>
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Tìm kiếm phim..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                className="search-input"
              />
            </div>
            {isSearchFocused && searchQuery && (
              <div className="search-results-dropdown">
                {searchResults.length > 0 ? (
                  searchResults.map((movie) => (
                    <a
                      href={`/movie/${movie.id}`}
                      key={movie.id}
                      className="search-result-item"
                    >
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                            : "https://via.placeholder.com/50x75.png?text=No+Image"
                        }
                        alt={movie.title}
                        className="result-poster"
                      />
                      <div className="result-info">
                        <span className="result-title">{movie.title}</span>
                        <span className="result-year">
                          {movie.release_date
                            ? movie.release_date.substring(0, 4)
                            : "N/A"}
                        </span>
                      </div>
                    </a>
                  ))
                ) : (
                  <div className="no-results">
                    Không tìm thấy kết quả.{" "}
                  </div>
                )}
              </div>
            )}
          </div>

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
                  onClick={() => handleLanguageChange("vi")}
                >
                  Tiếng Việt
                </div>
                <div
                  className="language-option"
                  onClick={() => handleLanguageChange("en")}
                >
                  English
                </div>
                <div
                  className="language-option"
                  onClick={() => handleLanguageChange("zh")}
                >
                  简体中文
                </div>
              </div>
            )}
          </div>

          <div className="user-actions" onClick={toggleAuthModal}>
            <User className="user-icon" />
          </div>
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isAuthModalOpen && (
        <div className="auth-modal-overlay">
          <div className="auth-modal-content" ref={authModalRef}>
            <button className="auth-modal-close-btn" onClick={toggleAuthModal}>
              <X size={24} />
            </button>
            <div className="auth-modal-header">
              <button className="auth-modal-register-btn">ĐĂNG KÝ NGAY</button>
            </div>
            <div className="auth-modal-body">
              <div className="input-group">
                <label htmlFor="username">
                  <User size={20} className="input-icon" /> Tài khoản
                </label>
                <input type="text" id="username" placeholder="Nhập tài khoản" />
              </div>
              <div className="input-group">
                <label htmlFor="password">
                  <span className="icon-wrapper"><i className="fa-solid fa-lock"></i></span> Mật khẩu
                </label>
                <input type="password" id="password" placeholder="Nhập mật khẩu" />
                <span className="password-toggle"><i className="fa-solid fa-eye-slash"></i></span>
              </div>
              <a href="#" className="forgot-password">Quên mật khẩu?</a>
              <button className="auth-modal-login-btn">Đăng nhập</button>
              <div className="or-connect">hoặc kết nối tài khoản</div>
              <div className="social-login">
                <button className="social-btn google">
                  <img src="https://img.icons8.com/color/48/000000/google-plus.png" alt="Google icon"/>
                </button>
                <button className="social-btn other">
                  <img src="https://img.icons8.com/ios-filled/50/000000/grid.png" alt="Other social icon"/>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}