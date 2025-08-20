import { useState, useEffect, useRef, useContext } from "react";
import { Link } from "react-router-dom";
import "../styles/DesktopNavigation.css";
import { LanguageContext } from "../context/LanguageContext";

interface Genre {
  id: number;
  name: string;
}

interface Country {
  iso_3166_1: string;
  english_name: string;
  native_name: string;
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
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  
  const genreDropdownRef = useRef<HTMLDivElement>(null);
  const genreNavLinkRef = useRef<HTMLAnchorElement>(null);
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const countryNavLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    fetchGenres(selectedLanguage);
    fetchCountries();
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
      if (
        isCountryDropdownOpen &&
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node) &&
        countryNavLinkRef.current &&
        !countryNavLinkRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isGenreDropdownOpen, isCountryDropdownOpen]);

  const fetchGenres = async (languageCode: string) => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

    if (!API_KEY || !BASE_URL) {
      console.error(t("api_key_or_base_url_missing"));
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
        throw new Error(`${t("http_error_status")}: ${response.status}`);
      }
      const data = await response.json();
      setGenres(data.genres);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };
  
  const fetchCountries = async () => {
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

    if (!API_KEY || !BASE_URL) {
      console.error(t("api_key_or_base_url_missing"));
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/configuration/countries?api_key=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`${t("http_error_status")}: ${response.status}`);
      }
      const data = await response.json();
      data.sort((a: Country, b: Country) => a.english_name.localeCompare(b.english_name));
      setCountries(data);
    } catch (error) {
      console.error("Error fetching countries:", error);
    }
  };

  const toggleGenreDropdown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsGenreDropdownOpen(!isGenreDropdownOpen);
    if (isCountryDropdownOpen) {
      setIsCountryDropdownOpen(false);
    }
  };
  
  const toggleCountryDropdown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsCountryDropdownOpen(!isCountryDropdownOpen);
    if (isGenreDropdownOpen) {
      setIsGenreDropdownOpen(false);
    }
  };

  const getMediaTypeForGenre = (genreId: number): 'movie' | 'tv' => {
    return 'movie';
  };
  
  const getMediaTypeForCountry = (countryCode: string): 'movie' | 'tv' => {
    return 'movie';
  };

  return (
    <>
      <nav className="desktop-nav">
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
        <div className="genre-dropdown-container" ref={countryDropdownRef}>
          <a href="#" className="nav-link" onClick={toggleCountryDropdown} ref={countryNavLinkRef}>
            {t("header_countries")}
            <span className={`genre-dropdown-arrow ${isCountryDropdownOpen ? 'open' : ''}`}></span>
          </a>
          {isCountryDropdownOpen && (
            <div className="genre-dropdown-content">
              <div className="genre-dropdown-pointer"></div>
              <div className="genre-list">
                {countries.length > 0 ? (
                  countries.map((country) => (
                    <Link
                      to={`/country/${getMediaTypeForCountry(country.iso_3166_1)}/${country.iso_3166_1}?name=${encodeURIComponent(country.english_name)}`}
                      key={country.iso_3166_1}
                      className="genre-item"
                      onClick={() => setIsCountryDropdownOpen(false)}
                    >
                      {country.english_name}
                    </Link>
                  ))
                ) : (
                  <div className="no-genres">{t("loading_countries")}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}