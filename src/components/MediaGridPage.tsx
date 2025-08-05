import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/MediaGridPage.css';
import MovieCard, { Movie } from './MovieCard';

interface MediaGridPageProps {
  title: string;
  endpoint: string;
}

const MediaGridPage: React.FC<MediaGridPageProps> = ({ title, endpoint }) => {
  const [media, setMedia] = useState<Movie[]>([]);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    setMedia([]);
    setPage(1);
    setTotalPages(1);
  }, [endpoint]);

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

    if (!API_KEY || !BASE_URL) {
      console.error("TMDB API Key or Base URL is not defined.");
      setLoading(false);
      return;
    }

    let apiUrl = `${BASE_URL}/${endpoint}`;
    const separator = endpoint.includes('?') ? '&' : '?';
    apiUrl = `${apiUrl}${separator}api_key=${API_KEY}&language=vi-VN&page=${page}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`Không thể lấy dữ liệu từ endpoint ${endpoint}, trang ${page}. Status: ${response.status}`);
      }
      const data = await response.json();

      setMedia(data.results || []);
      setTotalPages(data.total_pages);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách media:", error);
      setMedia([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, endpoint]);

  useEffect(() => {
    fetchMedia();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page, endpoint, fetchMedia]);

  const handleBack = () => {
    navigate("/");
  };

  const renderPagination = () => {
    const pagesToShow = 5;
    const startPage = Math.max(1, page - Math.floor(pagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + pagesToShow - 1);

    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`page-number ${i === page ? 'active' : ''}`}
          onClick={() => setPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        {page > 1 && (
          <button className="page-nav" onClick={() => setPage(page - 1)}>&lt; Trước</button>
        )}
        {startPage > 1 && (
          <>
            <button className="page-number" onClick={() => setPage(1)}>1</button>
            <span className="pagination-dots">...</span>
          </>
        )}
        {pageNumbers}
        {endPage < totalPages && (
          <>
            <span className="pagination-dots">...</span>
            <button className="page-number" onClick={() => setPage(totalPages)}>{totalPages}</button>
          </>
        )}
        {page < totalPages && (
          <button className="page-nav" onClick={() => setPage(page + 1)}>Sau &gt;</button>
        )}
      </div>
    );
  };

  return (
    <div className="media-grid-page">
      <button onClick={handleBack} className="back-button">
        Quay lại
      </button>

      <h1 className="page-title">{title}</h1>
      <div className="breadcrumb">
        Trang chủ / {title}
      </div>
      <div className="filters-container">
        <div className="filters-row">
          <div className="filter-dropdown">
            <span className="dropdown-label">Sắp xếp theo</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          <div className="filter-dropdown">
            <span className="dropdown-label">Năm phát hành</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          <div className="filter-dropdown">
            <span className="dropdown-label">Trạng thái</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          <div className="filter-dropdown">
            <span className="dropdown-label">Thể loại</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          <button className="filter-button">Lọc phim</button>
        </div>
      </div>
      {loading ? (
        <p className="loading-initial">Đang tải...</p>
      ) : (
        <div className="media-grid">
          {media.length > 0 ? (
            media.map((item) => (
              <MovieCard key={item.id} movie={item} />
            ))
          ) : (
            <p className="loading-initial">Không có dữ liệu.</p>
          )}
        </div>
      )}

      {!loading && totalPages > 1 && renderPagination()}
    </div>
  );
};

export default MediaGridPage;