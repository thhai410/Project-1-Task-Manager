import React from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div style={{padding:20,maxWidth:720,margin:'24px auto'}}>
      <h2>Đăng nhập</h2>
      <p>Trang đăng nhập tạm — bạn có thể thay bằng form thực tế sau.</p>
      <p>
        <Link to="/">Quay về trang chủ</Link>
      </p>
    </div>
  );
}
