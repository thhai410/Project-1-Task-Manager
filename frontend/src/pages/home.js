import React from 'react';
import { Link } from 'react-router-dom';
import './home.css';

export default function Home() {
  return (
    <div className="hm-root">
      <header className="hm-header">
        <div className="hm-header-inner">
          <div className="hm-logo">
            <img src="/assets/logo.png" alt="logo" className="hm-logo-img" />
            <span className="hm-logo-text">Task Manager</span>
          </div>
          <div className="hm-auth">
            <Link to="/login" className="btn-outline">Đăng nhập</Link>
            <span className='btn-line'>|</span>
            <Link to="/register" className="btn-primary">Đăng ký ngay</Link>
          </div>
        </div>
      </header>

      <main className="hm-main">
        <section className="hero">
          <div className="hero-inner">
            <img className='icon-nice-work' src='/assets/nice_work.png' alt='nice_work'></img>
            <img className='icon-task' src='/assets/task.png' alt='task'></img>
            <img className='icon-messaging' src='/assets/messaging.png' alt='message'></img>
            <h1 className="hero-title">Quản lý công việc của bạn hiệu quả, đơn giản với Task Manager</h1>
            <p className="hero-sub">Tổ chức công việc, theo dõi tiến độ thông minh và nâng cao năng suất đội nhóm. <span class="bold-text">Task Manager</span> giúp đội nhóm của bạn đạt được mục tiêu một cách nhanh chóng.</p>
            <Link to="/register" className="cta">Bắt đầu ngay bây giờ</Link>
          </div>
        </section>

        <section className="features">
          <div className="feature">
            <div className="feature-media mockshot">
              <div className="screen-sample">Ảnh minh họa</div>
            </div>
            <div className="feature-body">
              <h3>Quản lý công việc trực quan</h3>
              <p>Chế độ xem Kanban giúp bạn sắp xếp nhiệm vụ theo từng giai đoạn. Kéo thả và phân công nhanh chóng để tiến độ luôn rõ ràng.</p>
            </div>
          </div>

          <div className="feature reverse">
            <div className="feature-body">
              <h3>Chính xác và hiệu quả</h3>
              <p>Chế độ xem Danh sách hiển thị tất cả dữ liệu liên quan cho phép thực hiện các thao tác hàng loạt một cách nhanh chóng.</p>
            </div>
            <div className="feature-media mockshot">
              <div className="screen-sample">Ảnh minh họa</div>
            </div>
          </div>

          <div className="feature">
            <div className="feature-media mockshot">
              <div className="screen-sample">Ảnh minh họa</div>
            </div>
            <div className="feature-body">
              <h3>Luôn nắm bắt tình hình dự án</h3>
              <p>Các bản cập nhật dự án được tạo ra theo thời gian thực, giúp bạn nắm rõ tiến độ, nguồn lực, và nhiệm vụ.</p>
            </div>
          </div>
        </section>

        <section className="cta-section">
          <h2>Sắp xếp thông minh, làm việc nhẹ nhàng</h2>
          <button className="cta grey">Bắt đầu ngay bây giờ</button>
        </section>
      </main>
    </div>
  );
}
