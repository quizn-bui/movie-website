import { useState, useEffect, useRef, useContext } from "react";
import { LanguageContext } from "../context/LanguageContext";
import { Search, Menu, X, User } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "../styles/Header.css";
import DesktopNavigation from "./DesktopNavigation";
import LanguageSelector from "./LanguageSelector";
import AuthModal from "./AuthModal";

interface MovieSearchResult {
  id: number;
  title: string;
  poster_path: string;
  release_date: string;
}

export default function Header() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("Header must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = context;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MovieSearchResult[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const authModalRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
      fetchSearchResults(searchQuery);
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
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isAuthModalOpen &&
        authModalRef.current &&
        !authModalRef.current.contains(event.target as Node)
      ) {
        setIsAuthModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAuthModalOpen]);

  const fetchSearchResults = async (query: string) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

    const apiLanguageCode = {
      VI: "vi-VN",
      en: "en-US",
      zh: "zh-CN",
    }[selectedLanguage] || "en-US";

    if (!API_KEY || !BASE_URL) return;

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

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && searchQuery.trim() !== "") {
      navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
      setSearchResults([]);
      setIsSearchFocused(false);
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
            <Link to="/" className="logo-link">
              <h1 className="logo">MoviX</h1>
            </Link>
          </div>
          <DesktopNavigation
            currentPath={location.pathname}
            className="desktop-nav"
          />
          <div className="search-container" ref={searchContainerRef}>
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleSearch}
                className="search-input"
              />
            </div>
            {isSearchFocused && searchQuery && (
              <div className="search-results-dropdown">
                {searchResults.length > 0 ? (
                  searchResults.map((movie) => (
                    <Link
                      to={`/movie/${movie.id}`}
                      key={movie.id}
                      className="search-result-item"
                    >
                      <img
                        src={
                          movie.poster_path
                            ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                            : "https://dummyimage.com/50x75/000/fff&text=No+Image"
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
                    </Link>
                  ))
                ) : (
                  <div className="no-results">
                    {t("no_results")}
                  </div>
                )}
              </div>
            )}
          </div>
          <LanguageSelector className="web-language" />
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
      {isMenuOpen && (
        <div className="mobile-menu-dropdown">
          <div className="mobile-menu-content">
            <div className="mobile-search-wrapper">
              <div className="search-wrapper">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onKeyDown={handleSearch}
                  className="search-input"
                />
              </div>
              {isSearchFocused && searchQuery && (
                <div className="search-results-dropdown mobile-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.map((movie) => (
                      <Link
                        to={`/movie/${movie.id}`}
                        key={movie.id}
                        className="search-result-item"
                      >
                        <img
                          src={
                            movie.poster_path
                              ? `https://image.tmdb.org/t/p/w92${movie.poster_path}`
                              : "https://dummyimage.com/50x75/000/fff&text=No+Image"
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
                      </Link>
                    ))
                  ) : (
                    <div className="no-results">
                      {t("no_results")}
                    </div>
                  )}
                </div>
              )}
            </div>
            <DesktopNavigation
              currentPath={location.pathname}
              className="mobile-nav"
            />
            <div className="mobile-actions">
              <LanguageSelector />
              <button className="mobile-user-actions" onClick={toggleAuthModal}>
                <User className="user-icon" />
              </button>
            </div>
          </div>
        </div>
      )}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={toggleAuthModal} 
        authModalRef={authModalRef as React.RefObject<HTMLDivElement>} 
      />
    </header>
  );
}