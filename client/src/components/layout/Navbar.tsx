/**
 * Navbar Component
 * Modern SaaS navbar with glassmorphism, animations, and mobile support
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Github, ChevronDown, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/components/ui/ToastProvider';
import { COLORS } from '@/lib/constants';
import Logo from './Logo';
import './Navbar.css';

interface NavLink {
  label: string;
  href: string;
  icon?: React.ReactNode;
  submenu?: NavLink[];
}

const navLinks: NavLink[] = [
  { label: 'Features', href: '#features' },
  { label: 'Deployments', href: '/deployments' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Docs', href: '/docs' },
];

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();
  const { notify } = useToast();

  const handleThemeToggle = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    toggleTheme();
    notify({
      variant: 'info',
      title: `${nextTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`,
      message: `Switched to ${nextTheme} theme.`,
    });
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on link click
  const handleNavClick = () => {
    setIsOpen(false);
    setActiveDropdown(null);
  };

  return (
    <>
      {/* Navbar Container */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-[1030] navbar ${
          scrolled ? 'navbar-scrolled' : ''
        }`}
        style={{
          backgroundColor: scrolled
            ? 'rgba(11, 16, 32, 0.7)'
            : 'rgba(11, 16, 32, 0.4)',
          backdropFilter: scrolled ? 'blur(12px)' : 'blur(6px)',
        }}
      >
        <div className="container-fluid">
          <div className="navbar-content">
            {/* Logo */}
            <motion.div
              className="navbar-logo"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Logo />
            </motion.div>

            {/* Desktop Navigation */}
            <div className="navbar-links-desktop">
              {navLinks.map((link) => (
                <motion.div
                  key={link.label}
                  className="nav-item-wrapper"
                  onHoverStart={() => setActiveDropdown(link.label)}
                  onHoverEnd={() => setActiveDropdown(null)}
                >
                  <a
                    href={link.href}
                    className="nav-link"
                    onClick={handleNavClick}
                  >
                    <span>{link.label}</span>
                    {link.submenu && (
                      <ChevronDown size={16} className="nav-chevron" />
                    )}
                  </a>

                  {/* Animated underline */}
                  <motion.div
                    className="nav-underline"
                    layoutId={`underline-${link.label}`}
                    initial={false}
                  />
                </motion.div>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="navbar-actions">
              <motion.button
                type="button"
                className="theme-toggle-btn"
                onClick={handleThemeToggle}
                aria-label="Toggle dark mode"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>

              {/* GitHub Login Button (Desktop) */}
              <motion.a
                href="/auth/github"
                className="btn btn-secondary gap-md hidden md:flex"
                aria-label="Sign in with GitHub"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Github size={18} />
                <span>Sign in</span>
              </motion.a>

              {/* Mobile Menu Toggle */}
              <motion.button
                className="btn-menu md:hidden"
                onClick={() => setIsOpen(!isOpen)}
                aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={isOpen}
                aria-controls="mobile-navigation-menu"
                whileTap={{ scale: 0.9 }}
              >
                <AnimatePresence mode="wait">
                  {isOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X size={24} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="open"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu size={24} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="mobile-navigation-menu"
            className="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className="mobile-menu-content">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  className="mobile-nav-link"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                  onClick={handleNavClick}
                >
                  {link.label}
                </motion.a>
              ))}

              {/* Mobile GitHub Button */}
              <motion.a
                href="/auth/github"
                className="mobile-github-btn"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: navLinks.length * 0.05, duration: 0.2 }}
                onClick={handleNavClick}
              >
                <Github size={18} />
                <span>Sign in with GitHub</span>
              </motion.a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed navbar */}
      <div className="navbar-spacer" />
    </>
  );
};

export default Navbar;
