// src/components/ActorCard.tsx
"use client"

import React from "react"
import { Link } from "react-router-dom"
import "../styles/ActorCard.css"

// Định nghĩa kiểu dữ liệu cho diễn viên
export interface Actor {
  id: number
  name: string
  profile_path: string | null
  media_type: "person"
  known_for: Array<{
    id: number;
    title?: string;
    name?: string;
  }>;
}

const ActorCard: React.FC<{ actor: Actor }> = ({ actor }) => {
  const imageBaseUrl = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;
  const imageUrl = actor.profile_path
    ? `${imageBaseUrl}${actor.profile_path}`
    : "/placeholder.svg?height=392&width=256&text=No+Image";

  return (
    <Link to={`/person/${actor.id}`} className="actor-card-link">
      <div className="actor-card">
        <div className="actor-poster-container">
          <img
            src={imageUrl}
            alt={actor.name}
            className="actor-poster"
          />
        </div>
        <div className="actor-info">
          <h3 className="actor-name">{actor.name}</h3>
        </div>
      </div>
    </Link>
  );
};

export default ActorCard;