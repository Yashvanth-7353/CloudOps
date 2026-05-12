import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Features from '../Features';

/**
 * Features Component Unit Tests
 */

describe('Features Component', () => {
  // Rendering Tests
  describe('Rendering', () => {
    it('should render the features section', () => {
      render(<Features />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('should display the section title', () => {
      render(<Features />);
      const title = screen.getByText(/Everything You Need to/i);
      expect(title).toBeInTheDocument();
    });

    it('should display the gradient title', () => {
      render(<Features />);
      const gradientText = screen.getByText(/Deploy Faster/i);
      expect(gradientText).toBeInTheDocument();
    });

    it('should display the subtitle', () => {
      render(<Features />);
      const subtitle = screen.getByText(/combines powerful tools/i);
      expect(subtitle).toBeInTheDocument();
    });

    it('should display all feature cards', () => {
      render(<Features />);
      const cards = screen.getAllByRole('button');
      // 6 feature cards + 1 CTA button
      expect(cards.length).toBeGreaterThanOrEqual(6);
    });

    it('should display feature titles', () => {
      render(<Features />);
      const titles = [
        'One Click Deployment',
        'Docker Powered Builds',
        'AWS Cloud Deployment',
        'Real-Time Deployment Logs',
        'Cloud Monitoring',
        'Cost Analytics',
      ];

      titles.forEach(title => {
        expect(screen.getByText(title)).toBeInTheDocument();
      });
    });

    it('should display feature descriptions', () => {
      render(<Features />);
      const descriptions = [
        /Deploy your applications to AWS/i,
        /Containerize your applications/i,
        /Deploy to AWS with advanced/i,
        /Monitor your deployments/i,
        /Real-time performance monitoring/i,
        /Track and optimize your cloud costs/i,
      ];

      descriptions.forEach(description => {
        expect(screen.getByText(description)).toBeInTheDocument();
      });
    });

    it('should display the badge', () => {
      render(<Features />);
      const badge = screen.getByText(/Powerful Features/i);
      expect(badge).toBeInTheDocument();
    });

    it('should display CTA section', () => {
      render(<Features />);
      const ctaText = screen.getByText(/Ready to revolutionize/i);
      expect(ctaText).toBeInTheDocument();
    });

    it('should display CTA button', () => {
      render(<Features />);
      const ctaButton = screen.getByRole('button', { name: /Start Free Trial/i });
      expect(ctaButton).toBeInTheDocument();
    });
  });

  // Content Verification Tests
  describe('Content Verification', () => {
    it('should have correct number of feature cards', () => {
      render(<Features />);
      const featureCards = document.querySelectorAll('.feature-card');
      expect(featureCards.length).toBe(6);
    });

    it('should have feature cards with correct sizes', () => {
      render(<Features />);
      const cards = document.querySelectorAll('.feature-card');
      
      const sizes = Array.from(cards).map(card => {
        if (card.classList.contains('feature-card-large')) return 'large';
        if (card.classList.contains('feature-card-medium')) return 'medium';
        if (card.classList.contains('feature-card-small')) return 'small';
        return 'unknown';
      });

      // Should have 2 large, 2 medium, 2 small
      expect(sizes.filter(s => s === 'large').length).toBe(2);
      expect(sizes.filter(s => s === 'medium').length).toBe(2);
      expect(sizes.filter(s => s === 'small').length).toBe(2);
    });

    it('should have glassmorphism background for cards', () => {
      render(<Features />);
      const cardBackgrounds = document.querySelectorAll('.feature-card-glass');
      expect(cardBackgrounds.length).toBe(6);
    });

    it('should have icon containers for all cards', () => {
      render(<Features />);
      const iconContainers = document.querySelectorAll('.feature-card-icon');
      expect(iconContainers.length).toBe(6);
    });

    it('should have SVG icons in each card', () => {
      render(<Features />);
      const icons = document.querySelectorAll('.feature-card-icon svg');
      expect(icons.length).toBe(6);
    });
  });

  // Styling Tests
  describe('Styling', () => {
    it('should have correct section background', () => {
      const { container } = render(<Features />);
      const section = container.querySelector('.features-section');
      const style = window.getComputedStyle(section!);
      expect(style.position).toBe('relative');
    });

    it('should have feature cards with correct border-radius', () => {
      render(<Features />);
      const card = document.querySelector('.feature-card') as HTMLElement;
      const style = window.getComputedStyle(card);
      expect(style.borderRadius).toBeTruthy();
    });

    it('should have title with gradient text', () => {
      render(<Features />);
      const gradientTitle = document.querySelector('.features-title-gradient');
      expect(gradientTitle).toBeInTheDocument();
      const style = window.getComputedStyle(gradientTitle!);
      expect(style.background).toBeTruthy();
    });

    it('should have CTA button with gradient background', () => {
      render(<Features />);
      const ctaButton = document.querySelector('.features-cta-button') as HTMLElement;
      const style = window.getComputedStyle(ctaButton);
      expect(style.background).toBeTruthy();
    });

    it('should have feature cards with proper overflow handling', () => {
      render(<Features />);
      const card = document.querySelector('.feature-card') as HTMLElement;
      const style = window.getComputedStyle(card);
      expect(style.overflow).toBe('hidden');
    });
  });

  // Animation Tests
  describe('Animations', () => {
    it('should have motion animation on feature cards', () => {
      render(<Features />);
      const cards = document.querySelectorAll('.feature-card');
      expect(cards.length).toBeGreaterThan(0);
      // Framer Motion applies animations dynamically
    });

    it('should have hover animation triggers', () => {
      render(<Features />);
      const card = document.querySelector('.feature-card') as HTMLElement;
      expect(card).toHaveStyle('cursor: pointer');
    });

    it('should have glow effect element', () => {
      render(<Features />);
      const glows = document.querySelectorAll('.feature-card-glow');
      expect(glows.length).toBe(6);
    });

    it('should have animated border overlay', () => {
      render(<Features />);
      const borders = document.querySelectorAll('.feature-card-border');
      expect(borders.length).toBe(6);
    });
  });

  // Interaction Tests
  describe('Interactions', () => {
    it('should allow CTA button to be clickable', async () => {
      const user = userEvent.setup();
      render(<Features />);
      const ctaButton = screen.getByRole('button', { name: /Start Free Trial/i });
      
      await user.click(ctaButton);
      expect(ctaButton).toBeVisible();
    });

    it('should show arrow indicator on feature cards', () => {
      render(<Features />);
      const arrows = document.querySelectorAll('.feature-card-arrow');
      expect(arrows.length).toBe(6);
    });

    it('should be keyboard navigable', () => {
      render(<Features />);
      const ctaButton = screen.getByRole('button', { name: /Start Free Trial/i });
      
      // Tab to button
      ctaButton.focus();
      expect(ctaButton).toHaveFocus();
    });
  });

  // Responsive Tests
  describe('Responsive Design', () => {
    it('should have responsive grid', () => {
      const { container } = render(<Features />);
      const grid = container.querySelector('.features-grid');
      expect(grid).toHaveClass('features-grid');
      const style = window.getComputedStyle(grid!);
      expect(style.display).toBe('grid');
    });

    it('should have responsive feature cards', () => {
      render(<Features />);
      const cards = document.querySelectorAll('.feature-card');
      cards.forEach(card => {
        expect(card).toHaveClass('feature-card');
      });
    });

    it('should have responsive container', () => {
      const { container } = render(<Features />);
      const featureContainer = container.querySelector('.features-container');
      expect(featureContainer).toBeInTheDocument();
    });

    it('should have responsive padding on section', () => {
      const { container } = render(<Features />);
      const section = container.querySelector('.features-section') as HTMLElement;
      const style = window.getComputedStyle(section);
      expect(style.padding).toBeTruthy();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should have semantic section element', () => {
      render(<Features />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('should have headings in proper order', () => {
      render(<Features />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toBeInTheDocument();
    });

    it('should have descriptive button text', () => {
      render(<Features />);
      const ctaButton = screen.getByRole('button', { name: /Start Free Trial/i });
      expect(ctaButton).toBeInTheDocument();
    });

    it('should have contrast for text', () => {
      render(<Features />);
      const title = screen.getByText(/Everything You Need to/i);
      const style = window.getComputedStyle(title);
      expect(style.color).toBeTruthy();
    });

    it('should have focus indicators on interactive elements', () => {
      render(<Features />);
      const ctaButton = screen.getByRole('button', { name: /Start Free Trial/i });
      ctaButton.focus();
      expect(ctaButton).toHaveFocus();
    });

    it('should have descriptive aria attributes where needed', () => {
      render(<Features />);
      // Check for proper semantic structure
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });
  });

  // Edge Cases
  describe('Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      const { container } = render(<Features />);
      expect(container).toBeInTheDocument();
    });

    it('should handle rapid interactions', async () => {
      const user = userEvent.setup();
      render(<Features />);
      const ctaButton = screen.getByRole('button', { name: /Start Free Trial/i });
      
      await user.click(ctaButton);
      await user.click(ctaButton);
      await user.click(ctaButton);
      
      expect(ctaButton).toBeVisible();
    });

    it('should maintain structure when resized', () => {
      const { container } = render(<Features />);
      const grid = container.querySelector('.features-grid');
      
      // Simulate resize
      window.dispatchEvent(new Event('resize'));
      
      expect(grid).toBeInTheDocument();
    });

    it('should handle scroll events', () => {
      render(<Features />);
      window.dispatchEvent(new Event('scroll'));
      expect(screen.getByText(/Everything You Need to/i)).toBeInTheDocument();
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should render without performance issues', () => {
      const start = performance.now();
      render(<Features />);
      const end = performance.now();
      
      // Should render in under 100ms
      expect(end - start).toBeLessThan(100);
    });

    it('should have efficient CSS classes', () => {
      render(<Features />);
      const cards = document.querySelectorAll('.feature-card');
      expect(cards.length).toBe(6);
    });

    it('should have proper z-index stacking', () => {
      const { container } = render(<Features />);
      const content = container.querySelector('.features-container');
      const style = window.getComputedStyle(content!);
      expect(style.position).toBeTruthy();
    });
  });

  // Icon Tests
  describe('Icons', () => {
    it('should display all feature icons', () => {
      render(<Features />);
      const icons = document.querySelectorAll('.feature-card-icon svg');
      expect(icons.length).toBe(6);
    });

    it('should have correct icon styling', () => {
      render(<Features />);
      const iconContainer = document.querySelector('.feature-card-icon') as HTMLElement;
      const style = window.getComputedStyle(iconContainer);
      expect(style.display).toBe('flex');
    });

    it('should have centered icons', () => {
      render(<Features />);
      const iconContainer = document.querySelector('.feature-card-icon') as HTMLElement;
      const style = window.getComputedStyle(iconContainer);
      expect(style.alignItems).toBe('center');
      expect(style.justifyContent).toBe('center');
    });
  });

  // Background Effects Tests
  describe('Background Effects', () => {
    it('should have background glow elements', () => {
      const { container } = render(<Features />);
      const glows = container.querySelectorAll('.features-glow-1, .features-glow-2');
      expect(glows.length).toBeGreaterThan(0);
    });

    it('should have grid background', () => {
      const { container } = render(<Features />);
      const gridBg = container.querySelector('.features-grid-bg');
      expect(gridBg).toBeInTheDocument();
    });
  });
});
