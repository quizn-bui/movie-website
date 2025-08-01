import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom"; // Đảm bảo Link đã được import
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

  // Hàm helper để xác định mediaType cho thể loại (mặc định là 'movie' vì API genre/movie/list)
  // Nếu bạn muốn TV Shows cũng có thể loại, bạn sẽ cần fetch genre/tv/list riêng
  // hoặc có một logic phức tạp hơn ở đây.
  const getMediaTypeForGenre = (genreId: number): 'movie' | 'tv' => {
      // Hiện tại, chúng ta chỉ fetch genre/movie/list, nên mặc định là 'movie'.
      // Nếu bạn muốn hỗ trợ thể loại cho TV Shows, bạn sẽ cần một cơ chế khác.
      return 'movie'; 
  };

  return (
    <>
      <nav className="desktop-nav">
        {/* ĐOẠN SỬA ĐỔI 1: Chuyển đổi liên kết "Trang chủ" từ <a> sang Link */}
        <Link to="/" className={`nav-link ${currentPath === '/' ? 'nav-link-active' : ''}`}>
          Trang chủ
        </Link>
        {/* Các liên kết khác giữ nguyên */}
        <Link to="/series" className={`nav-link ${currentPath === '/series' ? 'nav-link-active' : ''}`}>
          Phim bộ
        </Link>
        <Link to="/movies" className={`nav-link ${currentPath === '/movies' ? 'nav-link-active' : ''}`}>
          Phim lẻ
        </Link>
        <Link to="/tv-shows" className={`nav-link ${currentPath === '/tv-shows' ? 'nav-link-active' : ''}`}>
          TV Shows
        </Link> 
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
                    // ĐOẠN SỬA ĐỔI 2: Thay đổi đường dẫn Link cho từng thể loại
                    <Link 
                      to={`/genre/${getMediaTypeForGenre(genre.id)}/${genre.id}?name=${encodeURIComponent(genre.name)}`} 
                      key={genre.id} 
                      className="genre-item"
                      onClick={() => setIsGenreDropdownOpen(false)} // Đóng dropdown khi click
                    >
                      {genre.name}
                    </Link>
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