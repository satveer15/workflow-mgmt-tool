import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        <Sidebar />
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
};
