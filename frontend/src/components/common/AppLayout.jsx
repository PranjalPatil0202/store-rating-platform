import React from 'react';
import Sidebar from '../common/Sidebar';

export default function AppLayout({ children }) {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
}
