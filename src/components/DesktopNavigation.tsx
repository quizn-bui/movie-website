import { useState, useEffect, useRef } from "react";
import "../styles/DesktopNavigation.css"; 

interface Genre {
  id: number;
  name: string;
}

interface DesktopNavigationProps {
  currentPath: string; 
  selectedLanguage: string; 
}

export default function DesktopNavigation({ currentPath, selectedLanguage }: DesktopNavigationProps) {
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

  return (
    <>
      <nav className="desktop-nav">
        <a href="#" className={`nav-link ${currentPath === '/' ? 'nav-link-active' : ''}`}>
          Trang chủ
        </a>
        <a href="#" className={`nav-link ${currentPath === '/movies' ? 'nav-link-active' : ''}`}>
          Phim bộ
        </a>
        <a href="#" className={`nav-link ${currentPath === '/movies' ? 'nav-link-active' : ''}`}>
          Phim lẻ
        </a>
        <a href="#" className={`nav-link ${currentPath === '/tv-shows' ? 'nav-link-active' : ''}`}>
          TV Shows
        </a>
        <div className="genre-dropdown-container" ref={genreDropdownRef}> 
          <a href="#" className="nav-link" onClick={toggleGenreDropdown} ref={genreNavLinkRef}>
            Thể loại
            <span className={`genre-dropdown-arrow ${isGenreDropdownOpen ? 'open' : ''}`}></span>
          </a>

          {isGenreDropdownOpen && (
            <div className="genre-dropdown-content">
              <div className="genre-dropdown-pointer"></div>
              <div className="genre-list">
                {genres.length > 0 ? (
                  genres.map((genre) => (
                    <a href={`/genre/${genre.id}`} key={genre.id} className="genre-item">
                      {genre.name}
                    </a>
                  ))
                ) : (
                  <div className="no-genres">Đang tải thể loại...</div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}