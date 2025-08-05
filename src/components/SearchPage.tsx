"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Search } from "lucide-react"
import MovieCard from "./MovieCard"
import "../styles/SearchPage.css"

export interface Movie {
  id: number
  title: string
  name?: string
  poster_path: string
  vote_average: number
  release_date: string
  first_air_date?: string
  overview: string
  media_type: "movie" | "tv" | "person";
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("query") || "";

  const [searchResults, setSearchResults] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState("movie")

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery) {
        setSearchResults([])
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const apiKey = import.meta.env.VITE_TMDB_API_KEY
        const baseUrl = import.meta.env.VITE_TMDB_BASE_URL
        
        if (!apiKey || !baseUrl) {
          throw new Error("Missing API configuration")
        }

        const endpoint = activeFilter === "movie" ? "/search/movie" : "/search/person"
        const url = `${baseUrl}${endpoint}?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&language=vi-VN&page=${currentPage}`

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        setSearchResults(data.results || [])
        setTotalPages(data.total_pages || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchSearchResults()
  }, [searchQuery, activeFilter, currentPage])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pagesToShow = 5;
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + pagesToShow - 1);
    
    if (endPage - startPage + 1 < pagesToShow) {
      startPage = Math.max(1, endPage - pagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={`pagination-btn page-number ${i === currentPage ? 'active' : ''}`}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="pagination-btn page-nav"
        >
          &lt; Trước
        </button>
        {startPage > 1 && (
          <>
            <button className="pagination-btn page-number" onClick={() => handlePageChange(1)}>1</button>
            {startPage > 2 && <span className="pagination-dots">...</span>}
          </>
        )}
        {pageNumbers}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
            <button className="pagination-btn page-number" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
          </>
        )}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="pagination-btn page-nav"
        >
          Sau &gt;
        </button>
      </div>
    );
  };

  return (
    <div className="search-page-container">
      <div className="search-page-header">
        <Search className="search-page-icon" />
        <h1 className="search-page-title">Kết quả tìm kiếm "{decodeURIComponent(searchQuery)}"</h1>
      </div>

      <div className="filter-buttons">
        <button
          className={`filter-btn ${activeFilter === "movie" ? "active" : ""}`}
          onClick={() => {
            setActiveFilter("movie");
            setCurrentPage(1);
          }}
        >
          Phim
        </button>
        <button
          className={`filter-btn ${activeFilter === "person" ? "active" : ""}`}
          onClick={() => {
            setActiveFilter("person");
            setCurrentPage(1);
          }}
        >
          Diễn viên
        </button>
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

      {loading && <div className="loading-message">Đang tải kết quả...</div>}
      {error && <div className="error-message">Lỗi: {error}</div>}
      {!loading && !error && searchResults.length === 0 && (
        <div className="no-results-message">Không tìm thấy kết quả nào.</div>
      )}

      {!loading && !error && searchResults.length > 0 && (
        <>
          <div className="search-results-grid">
            {searchResults.map((movie) => (
              <MovieCard 
                  key={movie.id} 
                  movie={movie} 
                  mediaType={movie.media_type}
              />
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  )
}