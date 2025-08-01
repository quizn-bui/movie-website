import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import '../styles/MediaGridPage.css';

interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
}

interface MediaGridPageProps {
  title: string;
  endpoint: string;
}

const MediaGridPage: React.FC<MediaGridPageProps> = ({ title, endpoint }) => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const navigate = useNavigate();
  const loaderRef = useRef<HTMLDivElement>(null);

  const TMDB_IMAGE_BASE_URL = import.meta.env.VITE_TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p/w500';

  useEffect(() => {
    setMedia([]);
    setPage(1);
    setHasMore(true);
  }, [endpoint, title]);

  const fetchMoreMedia = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
    const BASE_URL = import.meta.env.VITE_TMDB_BASE_URL;

    if (!API_KEY || !BASE_URL) {
      console.error("TMDB API Key or Base URL is not defined.");
      setLoading(false);
      setHasMore(false);
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
      
      if (Array.isArray(data.results) && data.results.length > 0) {
        setMedia((prevMedia) => {
          const existingIds = new Set(prevMedia.map(item => item.id));
          const newMediaItems = data.results.filter(
            (newItem: MediaItem) => !existingIds.has(newItem.id)
          );
          return [...prevMedia, ...newMediaItems];
        });
      } else {
        setHasMore(false);
      }

      if (page >= data.total_pages) {
        setHasMore(false);
      }

    } catch (error) {
      console.error("Lỗi khi lấy danh sách media:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, endpoint, loading, hasMore]);

  useEffect(() => {
    if ((page === 1 && media.length === 0) || (page > 1 && !loading)) {
      fetchMoreMedia();
    }
  }, [page, endpoint, fetchMoreMedia, loading, media.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage((prevPage) => prevPage + 1);
        }
      },
      { threshold: 0.5 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading]);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="media-grid-page">
      <button onClick={handleBack} className="back-button">
         Quay lại
      </button>
      <h1 className="page-title">{title}</h1>
      <div className="media-grid">
        {media.length > 0 ? (
          media.map((item) => (
            <div key={item.id} className="media-item">
              <img
                src={item.poster_path ? `${TMDB_IMAGE_BASE_URL}${item.poster_path}` : "/placeholder.jpg"}
                alt={item.title || item.name || 'poster'}
                className="media-image"
                loading="lazy" 
              />
              <div className="media-info">
                <h2 className="media-name">{item.title || item.name}</h2>
                <p className="media-rating">Đánh giá: {item.vote_average.toFixed(1)}/10</p>
              </div>
            </div>
          ))
        ) : (
          <p className="loading-initial">
            {loading ? "Đang tải..." : "Không có dữ liệu hoặc lỗi tải."}
          </p>
        )}
      </div>

      <div ref={loaderRef} className="loader-container">
        {loading && <p className="loading-message">Đang tải thêm...</p>}
        {!loading && !hasMore && media.length > 0 && ( 
          <p className="no-more-media">Đã hết nội dung để hiển thị.</p>
        )}
      </div>
    </div>
  );
};

export default MediaGridPage;