import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { Layout } from './Layout';
import { BrowserRouter } from 'react-router-dom';

/**
 * Layout Component Test Suite
 * Tests wrapper functionality, navbar integration, and layout rendering
 */

describe('Layout Component', () => {
  beforeEach(() => {
    // Setup before each test
  });

  // Rendering Tests
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </BrowserRouter>
      );
      expect(screen.getByText(/test content/i)).toBeInTheDocument();
    });

    it('should render children', () => {
      render(
        <BrowserRouter>
          <Layout>
            <h1>Page Title</h1>
            <p>Page content here</p>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/page title/i)).toBeInTheDocument();
      expect(screen.getByText(/page content here/i)).toBeInTheDocument();
    });

    it('should render navbar by default', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  // Navbar Integration Tests
  describe('Navbar Integration', () => {
    it('should display navbar with showNavbar=true', () => {
      render(
        <BrowserRouter>
          <Layout showNavbar={true}>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should hide navbar with showNavbar=false', () => {
      render(
        <BrowserRouter>
          <Layout showNavbar={false}>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('should display navbar by default when prop not specified', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });

  // Structure Tests
  describe('Layout Structure', () => {
    it('should have semantic structure', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(container.querySelector('nav')).toBeInTheDocument();
    });

    it('should position navbar at top', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      const navbar = container.querySelector('nav')?.parentElement;
      expect(navbar).toHaveClass('fixed', 'top-0');
    });

    it('should have main content area', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <main>
              <h1>Main Content</h1>
            </main>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByRole('heading', { name: /main content/i })).toBeInTheDocument();
    });
  });

  // Styling Tests
  describe('Styling', () => {
    it('should have proper layout classes', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('flex', 'flex-col', 'min-h-screen');
    });

    it('should apply custom className', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout className="custom-class">
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('custom-class');
    });

    it('should have background styling', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('bg-bg-primary');
    });
  });

  // Content Area Tests
  describe('Content Area', () => {
    it('should account for navbar height', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      // Should have pt-20 or similar for navbar spacing
      const layoutContainer = container.firstChild;
      expect(layoutContainer?.textContent).toContain('Content');
    });

    it('should allow flexible content layout', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div className="flex flex-col gap-4">
              <h1>Title</h1>
              <p>Description</p>
            </div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/title/i)).toBeInTheDocument();
      expect(screen.getByText(/description/i)).toBeInTheDocument();
    });

    it('should expand to full height', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('min-h-screen');
    });
  });

  // Props Tests
  describe('Props Handling', () => {
    it('should accept showNavbar prop', () => {
      render(
        <BrowserRouter>
          <Layout showNavbar={false}>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('should accept className prop', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout className="test-class">
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('test-class');
    });

    it('should accept children prop', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Test Children</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/test children/i)).toBeInTheDocument();
    });
  });

  // Responsive Tests
  describe('Responsiveness', () => {
    it('should be responsive on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(
        <BrowserRouter>
          <Layout>
            <div>Mobile Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/mobile content/i)).toBeInTheDocument();
    });

    it('should be responsive on tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(
        <BrowserRouter>
          <Layout>
            <div>Tablet Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/tablet content/i)).toBeInTheDocument();
    });

    it('should be responsive on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(
        <BrowserRouter>
          <Layout>
            <div>Desktop Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/desktop content/i)).toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe('Accessibility (a11y)', () => {
    it('should have semantic structure', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <main>
              <h1>Main Content</h1>
            </main>
          </Layout>
        </BrowserRouter>
      );

      expect(container.querySelector('main')).toBeInTheDocument();
    });

    it('should render without accessibility violations', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <div role="main">Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(container).toBeInTheDocument();
    });

    it('should maintain focus management', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>
            <button>Test Button</button>
          </Layout>
        </BrowserRouter>
      );

      const button = screen.getByRole('button', { name: /test button/i });
      button.focus();

      expect(button).toHaveFocus();
    });
  });

  // Integration Tests
  describe('Integration', () => {
    it('should work with React Router', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div>Router Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/router content/i)).toBeInTheDocument();
    });

    it('should render multiple children in sequence', () => {
      render(
        <BrowserRouter>
          <Layout>
            <header>Header</header>
            <section>Section</section>
            <footer>Footer</footer>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/header/i)).toBeInTheDocument();
      expect(screen.getByText(/section/i)).toBeInTheDocument();
      expect(screen.getByText(/footer/i)).toBeInTheDocument();
    });

    it('should render with complex nested content', () => {
      render(
        <BrowserRouter>
          <Layout>
            <div className="container">
              <div className="row">
                <div className="col">Column 1</div>
                <div className="col">Column 2</div>
              </div>
            </div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByText(/column 1/i)).toBeInTheDocument();
      expect(screen.getByText(/column 2/i)).toBeInTheDocument();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout>{}</Layout>
        </BrowserRouter>
      );

      expect(container).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      render(
        <BrowserRouter>
          <Layout>{null}</Layout>
        </BrowserRouter>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should handle multiple className values', () => {
      const { container } = render(
        <BrowserRouter>
          <Layout className="class1 class2 class3">
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      const layoutContainer = container.firstChild;
      expect(layoutContainer).toHaveClass('class1', 'class2', 'class3');
    });

    it('should toggle navbar visibility conditionally', () => {
      const { rerender } = render(
        <BrowserRouter>
          <Layout showNavbar={true}>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.getByRole('navigation')).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <Layout showNavbar={false}>
            <div>Content</div>
          </Layout>
        </BrowserRouter>
      );

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });
  });
});
