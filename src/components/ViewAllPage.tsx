"use client"

import { useState, useEffect } from 'react';
import '../styles/ViewAllPage.css';
import MovieCard, { Movie }from './MovieCard'; 


interface ViewAllPageProps {
  title: string;
  endpoint: string;
  onBack: () => void;
}

const ViewAllPage = ({ title, endpoint, onBack }: ViewAllPageProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_TMDB_API_KEY;
  const baseUrl = import.meta.env.VITE_TMDB_BASE_URL;
  const mediaType = endpoint.includes('movie') ? 'movie' : 'tv';

  useEffect(() => {
    const fetchMovies = async () => {
      if (!apiKey || !baseUrl || !endpoint) {
        setError("Missing API configuration or endpoint.");
        setLoading(false);
        return;
      }

      const url = `${baseUrl}/${endpoint}?api_key=${apiKey}&language=vi-VN&page=1`;

      try {
        setLoading(true);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        const moviesWithMediaType = data.results.map((item: any) => ({
          ...item,
          media_type: mediaType
        }));
        
        setMovies(moviesWithMediaType);
        setError(null);
      } catch (e) {
        console.error("Error fetching movies:", e);
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [apiKey, baseUrl, endpoint, mediaType]);

  if (loading) {
    return <div className="loading-state">Đang tải phim...</div>;
  }

  if (error) {
    return <div className="error-state">Lỗi: {error}</div>;
  }

  return (
    <div className="view-all-page">
      <button onClick={onBack} className="back-button">
        Quay lại
      </button>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        <div className="breadcrumb">
          Trang chủ / {title}
        </div>
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
      <div className="movie-grid">
        {movies.map(movie => (
          <MovieCard 
          key={movie.id} 
          movie={movie} 
          mediaType={mediaType} />
        ))}
      </div>
    </div>
  );
};

export default ViewAllPage;