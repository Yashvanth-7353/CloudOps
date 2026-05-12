/**
 * Layout Wrapper Component
 * Standard layout with navbar for all pages
 */

import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  showNavbar?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  showNavbar = true,
  className = '',
}) => {
  return (
    <div className="relative z-10 min-h-screen flex flex-col">
      {showNavbar && <Navbar />}
      <main className={`page-shell page-shell--wide flex-1 ${className}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
