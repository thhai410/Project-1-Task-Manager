import React from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div style={{padding:20,maxWidth:720,margin:'24px auto'}}>
      <h2>Đăng ký</h2>
      <p>Trang đăng ký tạm — bạn có thể thay bằng form thực tế sau.</p>
      <p>
        <Link to="/">Quay về trang chủ</Link>
      </p>
    </div>
  );
}
