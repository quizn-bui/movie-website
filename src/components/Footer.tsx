import "../styles/Footer.css";

export default function Footer() {

  return (
    <footer className="footer-container">
      <div className="footer-content">
        <a href="/" className="logo-link">
          <h1 className="footer-logo">MoviX</h1>
        </a>
        <p className="footer-description">
          MoviX – Vũ trụ phim - Trang xem phim online chất lượng cao miễn phí Vietsub, thuyết minh, lồng tiếng full HD. Kho phim mới khổng lồ, phim chiếu rạp, phim bộ, phim lẻ từ nhiều quốc gia như Việt Nam, Hàn Quốc, Trung Quốc, Thái Lan, Nhật Bản, Âu Mỹ… đa dạng thể loại. Khám phá nền tảng phim trực tuyến hay nhất 2025 chất lượng 4K!
        </p>

        <p className="footer-copyright">
          © 2025 MoviX
        </p>
      </div>
    </footer>
  );
}