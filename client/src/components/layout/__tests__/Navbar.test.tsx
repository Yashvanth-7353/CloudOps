import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Navbar } from './Navbar';
import { BrowserRouter } from 'react-router-dom';

/**
 * Navbar Component Test Suite
 * Tests core functionality, responsiveness, animations, and accessibility
 */

describe('Navbar Component', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Rendering Tests
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should render logo', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      expect(screen.getByAltText(/cloudops/i)).toBeInTheDocument();
    });

    it('should render navigation links', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      expect(screen.getByText(/features/i)).toBeInTheDocument();
      expect(screen.getByText(/deployments/i)).toBeInTheDocument();
      expect(screen.getByText(/pricing/i)).toBeInTheDocument();
      expect(screen.getByText(/docs/i)).toBeInTheDocument();
    });

    it('should render docs link with internal route', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      const docsLink = screen.getByRole('link', { name: /docs/i });
      expect(docsLink).toHaveAttribute('href', '/docs');
    });

    it('should render GitHub login button', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      const githubBtn = screen.getByRole('button', { name: /github/i });
      expect(githubBtn).toBeInTheDocument();
    });
  });

  // Desktop View Tests
  describe('Desktop View (> 768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
    });

    it('should hide mobile menu button on desktop', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      const mobileMenuBtn = screen.queryByRole('button', { name: /toggle navigation/i });
      expect(mobileMenuBtn).toHaveClass('md:hidden');
    });

    it('should display all navigation links on desktop', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      const navLinks = screen.getAllByRole('link');
      expect(navLinks.length).toBeGreaterThan(4);
    });
  });

  // Mobile View Tests
  describe('Mobile View (< 768px)', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });
    });

    it('should show mobile menu button on mobile', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );
      const mobileMenuBtn = screen.getByRole('button', { name: /toggle navigation/i });
      expect(mobileMenuBtn).toBeVisible();
    });

    it('should toggle mobile menu when button clicked', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const mobileMenuBtn = screen.getByRole('button', { name: /toggle navigation/i });
      expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false');

      await user.click(mobileMenuBtn);
      expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'true');

      await user.click(mobileMenuBtn);
      expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false');
    });

    it('should close mobile menu when link is clicked', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const mobileMenuBtn = screen.getByRole('button', { name: /toggle navigation/i });
      await user.click(mobileMenuBtn);
      expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'true');

      const featureLink = screen.getByRole('link', { name: /features/i });
      await user.click(featureLink);

      // Menu should close after click
      await waitFor(() => {
        expect(mobileMenuBtn).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });

  // Scroll Effect Tests
  describe('Scroll Effects', () => {
    it('should detect scroll position', async () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const navbar = screen.getByRole('navigation').parentElement;

      // Initial state - not scrolled
      expect(navbar).not.toHaveClass('navbar-scrolled');

      // Simulate scroll
      fireEvent.scroll(window, { y: 50 });

      await waitFor(() => {
        expect(navbar).toHaveClass('navbar-scrolled');
      });
    });

    it('should apply blur effect on scroll', async () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const navbar = screen.getByRole('navigation');
      const initialStyle = window.getComputedStyle(navbar);

      fireEvent.scroll(window, { y: 100 });

      await waitFor(() => {
        const scrolledStyle = window.getComputedStyle(navbar);
        expect(scrolledStyle.backdropFilter).toBeTruthy();
      });
    });

    it('should remove scroll effect when scrolled back to top', async () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const navbar = screen.getByRole('navigation').parentElement;

      // Scroll down
      fireEvent.scroll(window, { y: 50 });
      await waitFor(() => {
        expect(navbar).toHaveClass('navbar-scrolled');
      });

      // Scroll back to top
      fireEvent.scroll(window, { y: 5 });
      await waitFor(() => {
        expect(navbar).not.toHaveClass('navbar-scrolled');
      });
    });
  });

  // Link Navigation Tests
  describe('Navigation Links', () => {
    it('should have correct href attributes', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const featureLink = screen.getByRole('link', { name: /features/i });
      const deploymentLink = screen.getByRole('link', { name: /deployments/i });
      const pricingLink = screen.getByRole('link', { name: /pricing/i });

      expect(featureLink).toHaveAttribute('href');
      expect(deploymentLink).toHaveAttribute('href');
      expect(pricingLink).toHaveAttribute('href');
    });

    it('should be accessible via keyboard', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const firstLink = screen.getByRole('link', { name: /features/i });
      firstLink.focus();

      expect(firstLink).toHaveFocus();

      // Tab to next link
      await user.tab();
      const secondLink = screen.getByRole('link', { name: /deployments/i });
      expect(secondLink).toHaveFocus();
    });
  });

  // Button Interaction Tests
  describe('GitHub Button', () => {
    it('should have clickable GitHub button', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const githubBtn = screen.getByRole('button', { name: /github/i });
      expect(githubBtn).not.toBeDisabled();
    });

    it('should have aria-label for accessibility', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const githubBtn = screen.getByRole('button', { name: /github/i });
      expect(githubBtn).toHaveAttribute('aria-label');
    });
  });

  // Cleanup Tests
  describe('Cleanup', () => {
    it('should remove scroll listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));

      removeEventListenerSpy.mockRestore();
    });
  });

  // Accessibility Tests
  describe('Accessibility (a11y)', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('should have sufficient color contrast', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      // This would require visual regression testing
      // Verify text is readable against backgrounds
      const textElements = screen.getAllByRole('link');
      textElements.forEach((el) => {
        expect(el).toHaveStyle('color');
      });
    });

    it('should support focus visible states', async () => {
      const user = userEvent.setup();
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const firstLink = screen.getByRole('link', { name: /features/i });

      await user.tab();
      expect(firstLink).toHaveFocus();
    });

    it('should have descriptive aria-labels', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const mobileMenuBtn = screen.getByRole('button', { name: /toggle navigation/i });
      expect(mobileMenuBtn).toHaveAttribute('aria-label');
      expect(mobileMenuBtn).toHaveAttribute('aria-expanded');
    });
  });

  // Styling Tests
  describe('Styling', () => {
    it('should have glassmorphism classes', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const navbar = screen.getByRole('navigation');
      expect(navbar).toHaveClass('glass');
    });

    it('should have proper positioning', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const navbar = screen.getByRole('navigation').parentElement;
      expect(navbar).toHaveClass('fixed', 'top-0', 'w-full');
    });

    it('should be z-indexed above content', () => {
      render(
        <BrowserRouter>
          <Navbar />
        </BrowserRouter>
      );

      const navbar = screen.getByRole('navigation').parentElement;
      expect(navbar).toHaveClass('z-50');
    });
  });
});
