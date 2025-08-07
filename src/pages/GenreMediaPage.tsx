import React from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MediaGridPage from '../pages/MediaGridPage';

const GenreMediaPage: React.FC = () => {
  const { mediaType, genreId } = useParams<{ mediaType: string; genreId: string }>();
  const [searchParams] = useSearchParams();
  const genreName = searchParams.get('name'); 

 
  let endpoint = '';
  let pageTitle = 'Thể loại'; 

  if (mediaType === 'movie' && genreId) {
    endpoint = `discover/movie?with_genres=${genreId}`;
    pageTitle = genreName ? `Phim Thể loại: ${genreName}` : 'Phim theo Thể loại';
  } else if (mediaType === 'tv' && genreId) {
    endpoint = `discover/tv?with_genres=${genreId}`;
    pageTitle = genreName ? `TV Shows Thể loại: ${genreName}` : 'TV Shows theo Thể loại';
  } else {

    return <p>Lỗi: Không tìm thấy thể loại hoặc loại nội dung không hợp lệ.</p>;
  }

  return (
    <MediaGridPage title={pageTitle} endpoint={endpoint} />
  );
};

export default GenreMediaPage;