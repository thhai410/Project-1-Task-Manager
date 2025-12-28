import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css';

export default function Home() {
  return (
    <div className="home-bg">
      <div className="home-overlay"/>

      <header className="home-top">
        <div className="home-top__inner">
          <div className="home-auth">
            <Link to="/login" className="lnk">Đăng nhập</Link>
            <Link to="/register" className="btn">Đăng ký</Link>
          </div>
        </div>
      </header>

      <main className="home-hero">
        <div className="home-hero__content">
          <div className="kicker">TASK MANAGER</div>
          <h1>Quản lý công việc hiệu quả</h1>
          <p className="sub">Escape the clutter and chaos – unleash your productivity</p>
          <p className="desc">Tổ chức công việc, theo dõi tiến độ thông minh và nâng cao năng suất đội nhóm. <strong>Task Manager</strong> giúp đội nhóm của bạn đạt được mục tiêu một cách nhanh chóng.</p>
          <Link to="/register" className="cta">Bắt đầu ngay bây giờ</Link>
        </div>
      </main>
    </div>
  );
}
