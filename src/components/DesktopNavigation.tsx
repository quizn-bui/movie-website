import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/DesktopNavigation.css";
import { LanguageContext } from "../context/LanguageContext";

interface Genre {
  id: number;
  name: string;
}

interface DesktopNavigationProps {
  currentPath: string;
}

export default function DesktopNavigation({ currentPath }: DesktopNavigationProps) {
  const languageContext = useContext(LanguageContext);
  if (!languageContext) {
    throw new Error("DesktopNavigation must be used within a LanguageProvider");
  }
  const { selectedLanguage, t } = languageContext;

  const [isGenreDropdownOpen, setIsGenreDropdownOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const genreNavLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    fetchGenres(selectedLanguage);
  }, [selectedLanguage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isGenreDropdownOpen &&
        genreDropdownRef.current &&
        !genreDropdownRef.current.contains(event.target as Node) &&
        genreNavLinkRef.current &&
        !genreNavLinkRef.current.contains(event.target as Node)
      ) {
        setIsGenreDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isGenreDropdownOpen]);

  const fetchGenres = async (languageCode: string) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

    if (!API_KEY || !BASE_URL) {
      console.error("TMDB API Key or Base URL is not defined.");
      return;
    }

    const apiLanguageCode = {
      vi: "vi-VN",
      en: "en-US",
      zh: "zh-CN",
    }[languageCode] || "en-US";

    try {
      const response = await fetch(
        `${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=${apiLanguageCode}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const toggleGenreDropdown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsGenreDropdownOpen(!isGenreDropdownOpen);
  };

  const getMediaTypeForGenre = (genreId: number): 'movie' | 'tv' => {
    return 'movie';
  };

  return (
    <>
      <nav className="desktop-nav">
        <Link to="/" className={`nav-link ${currentPath === '/' ? 'nav-link-active' : ''}`}>
          {t("homepage")}
        </Link>
        <Link to="/series" className={`nav-link ${currentPath === '/series' ? 'nav-link-active' : ''}`}>
          {t("header_series")}
        </Link>
        <Link to="/movies" className={`nav-link ${currentPath === '/movies' ? 'nav-link-active' : ''}`}>
          {t("header_movies")}
        </Link>
        <Link to="/tv-shows" className={`nav-link ${currentPath === '/tv-shows' ? 'nav-link-active' : ''}`}>
          {t("header_tv_shows")}
        </Link>
        <div className="genre-dropdown-container" ref={genreDropdownRef}>
          <a href="#" className="nav-link" onClick={toggleGenreDropdown} ref={genreNavLinkRef}>
            {t("header_genres")}
            <span className={`genre-dropdown-arrow ${isGenreDropdownOpen ? 'open' : ''}`}></span>
          </a>
          {isGenreDropdownOpen && (
            <div className="genre-dropdown-content">
              <div className="genre-dropdown-pointer"></div>
              <div className="genre-list">
                {genres.length > 0 ? (
                  genres.map((genre) => (
                    <Link
                      to={`/genre/${getMediaTypeForGenre(genre.id)}/${genre.id}?name=${encodeURIComponent(genre.name)}`}
                      key={genre.id}
                      className="genre-item"
                      onClick={() => setIsGenreDropdownOpen(false)}
                    >
                      {genre.name}
                    </Link>
                  ))
                ) : (
                  <div className="no-genres">{t("loading_genres")}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}