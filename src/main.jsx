//main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import AdminApp from './AdminApp.jsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
const currentPath = window.location.pathname.replace(/\/+$/, '');
const isAdminRoute = currentPath === '/admin' || currentPath.endsWith('/admin');
root.render(
  <React.StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </React.StrictMode>
);
