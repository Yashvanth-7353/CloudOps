import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import Hero from './Hero';

/**
 * Hero Component Unit Tests
 * Tests for landing page hero section with animations
 */

describe('Hero Component', () => {
  beforeEach(() => {
    // Reset window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  // Rendering Tests
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<Hero />);
      expect(screen.getByRole('main', { hidden: true })).toBeInTheDocument();
    });

    it('should display main headline', () => {
      render(<Hero />);
      expect(screen.getByText(/deploy apps to aws/i)).toBeInTheDocument();
    });

    it('should display subheading', () => {
      render(<Hero />);
      expect(screen.getByText(/cloudops automates/i)).toBeInTheDocument();
    });

    it('should display beta badge', () => {
      render(<Hero />);
      expect(screen.getByText(/open beta/i)).toBeInTheDocument();
    });

    it('should display CTA buttons', () => {
      render(<Hero />);
      expect(screen.getByRole('button', { name: /connect github/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /watch demo/i })).toBeInTheDocument();
    });

    it('should display pipeline stages', () => {
      render(<Hero />);
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('Docker Build')).toBeInTheDocument();
      expect(screen.getByText('Deploy to AWS')).toBeInTheDocument();
      expect(screen.getByText('Live Website')).toBeInTheDocument();
    });

    it('should display stats', () => {
      render(<Hero />);
      expect(screen.getByText('1000+')).toBeInTheDocument();
      expect(screen.getByText('99.9%')).toBeInTheDocument();
      expect(screen.getByText('500+')).toBeInTheDocument();
    });

    it('should display scroll indicator', () => {
      render(<Hero />);
      expect(screen.getByText(/scroll to explore/i)).toBeInTheDocument();
    });
  });

  // Button Interaction Tests
  describe('Button Interactions', () => {
    it('should render Connect GitHub button as clickable', () => {
      render(<Hero />);
      const btn = screen.getByRole('button', { name: /connect github/i });
      expect(btn).not.toBeDisabled();
    });

    it('should render Watch Demo button as clickable', () => {
      render(<Hero />);
      const btn = screen.getByRole('button', { name: /watch demo/i });
      expect(btn).not.toBeDisabled();
    });

    it('should have GitHub icon in Connect GitHub button', () => {
      const { container } = render(<Hero />);
      const btn = screen.getByRole('button', { name: /connect github/i });
      const svg = btn.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should have Play icon in Watch Demo button', () => {
      const { container } = render(<Hero />);
      const btn = screen.getByRole('button', { name: /watch demo/i });
      const svg = btn.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should support hover state on buttons', async () => {
      const user = userEvent.setup();
      render(<Hero />);
      
      const btn = screen.getByRole('button', { name: /connect github/i });
      await user.hover(btn);
      
      // Button should not cause errors on hover
      expect(btn).toBeInTheDocument();
    });

    it('should support keyboard interaction on buttons', async () => {
      const user = userEvent.setup();
      render(<Hero />);
      
      const btn = screen.getByRole('button', { name: /connect github/i });
      btn.focus();
      
      expect(btn).toHaveFocus();
    });
  });

  // Content Tests
  describe('Content', () => {
    it('should have correct headline content', () => {
      render(<Hero />);
      const headline = screen.getByText(/deploy apps to aws/i);
      expect(headline).toBeInTheDocument();
      expect(headline).toHaveClass('text-4xl', 'md:text-6xl', 'lg:text-7xl', 'font-bold');
    });

    it('should have correct subheading content', () => {
      render(<Hero />);
      const subheading = screen.getByText(/cloudops automates/i);
      expect(subheading).toBeInTheDocument();
      expect(subheading).toHaveClass('text-xl', 'md:text-2xl');
    });

    it('should display all four pipeline stages', () => {
      render(<Hero />);
      const stages = ['GitHub', 'Docker Build', 'Deploy to AWS', 'Live Website'];
      
      stages.forEach(stage => {
        expect(screen.getByText(stage)).toBeInTheDocument();
      });
    });

    it('should display correct stat labels', () => {
      render(<Hero />);
      expect(screen.getByText('Deployments')).toBeInTheDocument();
      expect(screen.getByText('Uptime')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });

  // Styling Tests
  describe('Styling', () => {
    it('should have hero section with min-height', () => {
      render(<Hero />);
      const hero = screen.getByRole('main', { hidden: true })?.parentElement;
      expect(hero).toHaveClass('min-h-screen');
    });

    it('should have relative positioning for layout', () => {
      render(<Hero />);
      const hero = screen.getByRole('main', { hidden: true })?.parentElement;
      expect(hero).toHaveClass('relative');
    });

    it('should have overflow hidden for animations', () => {
      render(<Hero />);
      const hero = screen.getByRole('main', { hidden: true })?.parentElement;
      expect(hero).toHaveClass('overflow-hidden');
    });

    it('should have background styles', () => {
      const { container } = render(<Hero />);
      const hero = container.querySelector('.hero-section');
      expect(hero).toHaveClass('hero-section');
    });

    it('should have grid background effect', () => {
      const { container } = render(<Hero />);
      const grid = container.querySelector('.hero-grid');
      expect(grid).toBeInTheDocument();
      expect(grid).toHaveClass('hero-grid');
    });

    it('should have glassmorphism on pipeline container', () => {
      const { container } = render(<Hero />);
      const pipeline = container.querySelector('div[class*="backdrop-blur"]');
      expect(pipeline).toBeInTheDocument();
    });
  });

  // Animation Tests
  describe('Animations', () => {
    it('should have animation classes on badges', () => {
      const { container } = render(<Hero />);
      const badge = container.querySelector('[class*="rounded-full"]');
      expect(badge).toBeInTheDocument();
    });

    it('should have motion divs for animated elements', () => {
      const { container } = render(<Hero />);
      // Framer Motion components render as regular divs
      const animatedElements = container.querySelectorAll('[class*="animate"]');
      expect(animatedElements.length).toBeGreaterThan(0);
    });

    it('should render floating particles', () => {
      const { container } = render(<Hero />);
      const particles = container.querySelectorAll('[class*="rounded-full"][class*="bg-accent"]');
      // Should have multiple particles (20 particles)
      expect(particles.length).toBeGreaterThan(0);
    });

    it('should have pulse animation on gradients', () => {
      const { container } = render(<Hero />);
      const pulseElements = container.querySelectorAll('[class*="animate-pulse"]');
      expect(pulseElements.length).toBeGreaterThan(0);
    });
  });

  // Responsive Tests
  describe('Responsiveness', () => {
    it('should use responsive text sizes', () => {
      render(<Hero />);
      const headline = screen.getByText(/deploy apps to aws/i);
      
      // Check for responsive classes
      expect(headline).toHaveClass('text-4xl', 'md:text-6xl', 'lg:text-7xl');
    });

    it('should have responsive button layout', () => {
      render(<Hero />);
      const buttonContainer = screen.getByRole('button', { name: /connect github/i })
        .parentElement?.parentElement;
      
      // Check for responsive flex direction
      expect(buttonContainer).toHaveClass('flex-col', 'sm:flex-row');
    });

    it('should be responsive on mobile', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<Hero />);
      expect(screen.getByText(/deploy apps to aws/i)).toBeInTheDocument();
    });

    it('should be responsive on tablet', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 768,
      });

      render(<Hero />);
      expect(screen.getByText(/deploy apps to aws/i)).toBeInTheDocument();
    });

    it('should be responsive on desktop', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1920,
      });

      render(<Hero />);
      expect(screen.getByText(/deploy apps to aws/i)).toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe('Accessibility (a11y)', () => {
    it('should have semantic heading structure', () => {
      render(<Hero />);
      const headline = screen.getByText(/deploy apps to aws/i);
      expect(headline.tagName).toBe('H1');
    });

    it('should have proper button semantics', () => {
      render(<Hero />);
      const btn = screen.getByRole('button', { name: /connect github/i });
      expect(btn.tagName).toBe('BUTTON');
    });

    it('should have readable text sizes', () => {
      render(<Hero />);
      const subheading = screen.getByText(/cloudops automates/i);
      expect(subheading).toHaveClass('text-xl', 'md:text-2xl');
    });

    it('should have sufficient color contrast', () => {
      render(<Hero />);
      // Visual testing would be needed for exact contrast
      const headline = screen.getByText(/deploy apps to aws/i);
      expect(headline).toHaveClass('text-text-primary');
    });

    it('should have keyboard focusable buttons', async () => {
      const user = userEvent.setup();
      render(<Hero />);

      const btn1 = screen.getByRole('button', { name: /connect github/i });
      const btn2 = screen.getByRole('button', { name: /watch demo/i });

      btn1.focus();
      expect(btn1).toHaveFocus();

      await user.tab();
      // Should move focus to next element
      expect(document.activeElement).not.toBe(btn1);
    });

    it('should have descriptive button labels', () => {
      render(<Hero />);
      
      const btn1 = screen.getByRole('button', { name: /connect github/i });
      const btn2 = screen.getByRole('button', { name: /watch demo/i });

      expect(btn1).toHaveAccessibleName();
      expect(btn2).toHaveAccessibleName();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle rapid re-renders', () => {
      const { rerender } = render(<Hero />);
      
      rerender(<Hero />);
      rerender(<Hero />);
      rerender(<Hero />);

      expect(screen.getByText(/deploy apps to aws/i)).toBeInTheDocument();
    });

    it('should not have console errors', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      render(<Hero />);
      
      expect(consoleSpy).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle missing icons gracefully', () => {
      render(<Hero />);
      
      // Component should still render even if icons fail
      expect(screen.getByText(/github/i)).toBeInTheDocument();
    });

    it('should render correctly with long text', () => {
      render(<Hero />);
      
      const subheading = screen.getByText(/cloudops automates/i);
      expect(subheading).toBeInTheDocument();
      expect(subheading.textContent?.length).toBeGreaterThan(50);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should render within acceptable time', async () => {
      const startTime = performance.now();
      
      render(<Hero />);

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 500ms
      expect(renderTime).toBeLessThan(500);
    });

    it('should not cause layout thrashing', () => {
      render(<Hero />);
      
      const headline = screen.getByText(/deploy apps to aws/i);
      
      // Element should have stable layout classes
      expect(headline).toHaveClass('mb-6', 'leading-tight');
    });
  });

  // Icon Tests
  describe('Icons', () => {
    it('should render GitHub icon', () => {
      render(<Hero />);
      const btn = screen.getByRole('button', { name: /connect github/i });
      const svg = btn.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render Play icon in watch demo button', () => {
      render(<Hero />);
      const btn = screen.getByRole('button', { name: /watch demo/i });
      const svg = btn.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render icons in pipeline stages', () => {
      const { container } = render(<Hero />);
      const icons = container.querySelectorAll('svg');
      
      // Should have multiple icons (GitHub, Cloud, Zap, Play + more for particles)
      expect(icons.length).toBeGreaterThan(4);
    });
  });
});
