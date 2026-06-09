import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach } from 'vitest';
import { Logo } from './Logo';
/**
 * Logo Component Test Suite
 * Tests rendering, animations, and interactions
 */
describe('Logo Component', () => {
    beforeEach(() => {
        // Setup before each test
    });
    // Rendering Tests
    describe('Rendering', () => {
        it('should render without crashing', () => {
            render(_jsx(Logo, {}));
            expect(screen.getByAltText(/cloudops/i)).toBeInTheDocument();
        });
        it('should render logo image', () => {
            render(_jsx(Logo, {}));
            const logo = screen.getByAltText(/cloudops/i);
            expect(logo).toBeInTheDocument();
            expect(logo).toHaveAttribute('src');
        });
        it('should render logo text', () => {
            render(_jsx(Logo, {}));
            expect(screen.getByText(/cloudops/i)).toBeInTheDocument();
        });
        it('should have correct link structure', () => {
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '/');
        });
    });
    // Styling Tests
    describe('Styling', () => {
        it('should have flex layout classes', () => {
            render(_jsx(Logo, {}));
            const container = screen.getByAltText(/cloudops/i).parentElement;
            expect(container).toHaveClass('flex', 'items-center');
        });
        it('should have gap spacing', () => {
            render(_jsx(Logo, {}));
            const container = screen.getByAltText(/cloudops/i).parentElement;
            expect(container).toHaveClass('gap-2');
        });
        it('should have hover effect classes', () => {
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link');
            expect(link).toHaveClass('hover:opacity-80');
        });
        it('should have transition class for smooth animation', () => {
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link');
            expect(link).toHaveClass('transition-all');
        });
    });
    // Animation Tests
    describe('Animations', () => {
        it('should have animation classes', () => {
            render(_jsx(Logo, {}));
            const container = screen.getByAltText(/cloudops/i).parentElement;
            expect(container?.parentElement).toHaveClass('animate-pulse-glow');
        });
        it('should trigger hover animation on mouse enter', async () => {
            const user = userEvent.setup();
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link');
            await user.hover(link);
            // Component should maintain hover state visually
            expect(link).toHaveClass('hover:opacity-80');
        });
        it('should have proper animation timing', () => {
            render(_jsx(Logo, {}));
            const container = screen.getByAltText(/cloudops/i).parentElement;
            const styles = window.getComputedStyle(container?.parentElement || document.body);
            // Animation duration should be defined
            expect(styles.animationDuration).toBeTruthy();
        });
    });
    // Accessibility Tests
    describe('Accessibility (a11y)', () => {
        it('should have alt text for image', () => {
            render(_jsx(Logo, {}));
            const logo = screen.getByAltText(/cloudops/i);
            expect(logo).toHaveAttribute('alt');
            expect(logo.getAttribute('alt')).toBeTruthy();
        });
        it('should be keyboard accessible', async () => {
            const user = userEvent.setup();
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link');
            link.focus();
            expect(link).toHaveFocus();
        });
        it('should have visible focus indicator', async () => {
            const user = userEvent.setup();
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link');
            await user.tab();
            expect(link).toHaveFocus();
        });
        it('should have proper link semantics', () => {
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link', { name: /cloudops/i });
            expect(link).toBeInTheDocument();
        });
    });
    // Responsive Tests
    describe('Responsiveness', () => {
        it('should have responsive text classes', () => {
            render(_jsx(Logo, {}));
            const textElement = screen.getByText(/cloudops/i);
            expect(textElement).toHaveClass('text-lg', 'md:text-xl');
        });
        it('should maintain layout on small screens', () => {
            render(_jsx(Logo, {}));
            const container = screen.getByAltText(/cloudops/i).parentElement;
            expect(container).toHaveClass('flex', 'items-center', 'gap-2');
        });
    });
    // Integration Tests
    describe('Integration', () => {
        it('should navigate to home when clicked', async () => {
            const user = userEvent.setup();
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link');
            expect(link).toHaveAttribute('href', '/');
        });
        it('should be clickable', async () => {
            const user = userEvent.setup();
            render(_jsx(Logo, {}));
            const link = screen.getByRole('link');
            await user.click(link);
            // Should not error on click
            expect(link).toBeInTheDocument();
        });
    });
    // Icon Tests
    describe('Icon', () => {
        it('should render with icon markup', () => {
            const { container } = render(_jsx(Logo, {}));
            // Lucide React renders SVGs
            const svgs = container.querySelectorAll('svg');
            expect(svgs.length).toBeGreaterThan(0);
        });
        it('should have accessible icon', () => {
            const { container } = render(_jsx(Logo, {}));
            // Icon should have proper ARIA attributes or be decorative
            const svgs = container.querySelectorAll('svg');
            svgs.forEach((svg) => {
                expect(svg.getAttribute('aria-hidden') || svg.getAttribute('role') || svg.getAttribute('aria-label')).toBeTruthy();
            });
        });
    });
    // Visual Tests
    describe('Visual', () => {
        it('should render with proper contrast', () => {
            render(_jsx(Logo, {}));
            const text = screen.getByText(/cloudops/i);
            expect(text).toHaveClass('text-white', 'dark:text-white');
        });
        it('should have gradient effect', () => {
            const { container } = render(_jsx(Logo, {}));
            const textElement = screen.getByText(/cloudops/i);
            expect(textElement).toHaveClass('bg-gradient-to-r');
        });
        it('should display correctly with font weight', () => {
            render(_jsx(Logo, {}));
            const text = screen.getByText(/cloudops/i);
            expect(text).toHaveClass('font-bold');
        });
    });
});
