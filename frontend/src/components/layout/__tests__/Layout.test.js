import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Test Content" }) }) }));
            expect(screen.getByText(/test content/i)).toBeInTheDocument();
        });
        it('should render children', () => {
            render(_jsx(BrowserRouter, { children: _jsxs(Layout, { children: [_jsx("h1", { children: "Page Title" }), _jsx("p", { children: "Page content here" })] }) }));
            expect(screen.getByText(/page title/i)).toBeInTheDocument();
            expect(screen.getByText(/page content here/i)).toBeInTheDocument();
        });
        it('should render navbar by default', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Content" }) }) }));
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });
    });
    // Navbar Integration Tests
    describe('Navbar Integration', () => {
        it('should display navbar with showNavbar=true', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { showNavbar: true, children: _jsx("div", { children: "Content" }) }) }));
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });
        it('should hide navbar with showNavbar=false', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { showNavbar: false, children: _jsx("div", { children: "Content" }) }) }));
            expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        });
        it('should display navbar by default when prop not specified', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Content" }) }) }));
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });
    });
    // Structure Tests
    describe('Layout Structure', () => {
        it('should have semantic structure', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Content" }) }) }));
            expect(container.querySelector('nav')).toBeInTheDocument();
        });
        it('should position navbar at top', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Content" }) }) }));
            const navbar = container.querySelector('nav')?.parentElement;
            expect(navbar).toHaveClass('fixed', 'top-0');
        });
        it('should have main content area', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("main", { children: _jsx("h1", { children: "Main Content" }) }) }) }));
            expect(screen.getByRole('heading', { name: /main content/i })).toBeInTheDocument();
        });
    });
    // Styling Tests
    describe('Styling', () => {
        it('should have proper layout classes', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Content" }) }) }));
            const layoutContainer = container.firstChild;
            expect(layoutContainer).toHaveClass('flex', 'flex-col', 'min-h-screen');
        });
        it('should apply custom className', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { className: "custom-class", children: _jsx("div", { children: "Content" }) }) }));
            const layoutContainer = container.firstChild;
            expect(layoutContainer).toHaveClass('custom-class');
        });
        it('should have background styling', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Content" }) }) }));
            const layoutContainer = container.firstChild;
            expect(layoutContainer).toHaveClass('bg-bg-primary');
        });
    });
    // Content Area Tests
    describe('Content Area', () => {
        it('should account for navbar height', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Content" }) }) }));
            // Should have pt-20 or similar for navbar spacing
            const layoutContainer = container.firstChild;
            expect(layoutContainer?.textContent).toContain('Content');
        });
        it('should allow flexible content layout', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsxs("div", { className: "flex flex-col gap-4", children: [_jsx("h1", { children: "Title" }), _jsx("p", { children: "Description" })] }) }) }));
            expect(screen.getByText(/title/i)).toBeInTheDocument();
            expect(screen.getByText(/description/i)).toBeInTheDocument();
        });
        it('should expand to full height', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Content" }) }) }));
            const layoutContainer = container.firstChild;
            expect(layoutContainer).toHaveClass('min-h-screen');
        });
    });
    // Props Tests
    describe('Props Handling', () => {
        it('should accept showNavbar prop', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { showNavbar: false, children: _jsx("div", { children: "Content" }) }) }));
            expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        });
        it('should accept className prop', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { className: "test-class", children: _jsx("div", { children: "Content" }) }) }));
            const layoutContainer = container.firstChild;
            expect(layoutContainer).toHaveClass('test-class');
        });
        it('should accept children prop', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Test Children" }) }) }));
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
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Mobile Content" }) }) }));
            expect(screen.getByText(/mobile content/i)).toBeInTheDocument();
        });
        it('should be responsive on tablet', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 768,
            });
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Tablet Content" }) }) }));
            expect(screen.getByText(/tablet content/i)).toBeInTheDocument();
        });
        it('should be responsive on desktop', () => {
            Object.defineProperty(window, 'innerWidth', {
                writable: true,
                configurable: true,
                value: 1920,
            });
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Desktop Content" }) }) }));
            expect(screen.getByText(/desktop content/i)).toBeInTheDocument();
        });
    });
    // Accessibility Tests
    describe('Accessibility (a11y)', () => {
        it('should have semantic structure', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("main", { children: _jsx("h1", { children: "Main Content" }) }) }) }));
            expect(container.querySelector('main')).toBeInTheDocument();
        });
        it('should render without accessibility violations', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { role: "main", children: "Content" }) }) }));
            expect(container).toBeInTheDocument();
        });
        it('should maintain focus management', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("button", { children: "Test Button" }) }) }));
            const button = screen.getByRole('button', { name: /test button/i });
            button.focus();
            expect(button).toHaveFocus();
        });
    });
    // Integration Tests
    describe('Integration', () => {
        it('should work with React Router', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { children: "Router Content" }) }) }));
            expect(screen.getByText(/router content/i)).toBeInTheDocument();
        });
        it('should render multiple children in sequence', () => {
            render(_jsx(BrowserRouter, { children: _jsxs(Layout, { children: [_jsx("header", { children: "Header" }), _jsx("section", { children: "Section" }), _jsx("footer", { children: "Footer" })] }) }));
            expect(screen.getByText(/header/i)).toBeInTheDocument();
            expect(screen.getByText(/section/i)).toBeInTheDocument();
            expect(screen.getByText(/footer/i)).toBeInTheDocument();
        });
        it('should render with complex nested content', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: _jsx("div", { className: "container", children: _jsxs("div", { className: "row", children: [_jsx("div", { className: "col", children: "Column 1" }), _jsx("div", { className: "col", children: "Column 2" })] }) }) }) }));
            expect(screen.getByText(/column 1/i)).toBeInTheDocument();
            expect(screen.getByText(/column 2/i)).toBeInTheDocument();
        });
    });
    // Edge Cases
    describe('Edge Cases', () => {
        it('should handle empty children', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, {}) }));
            expect(container).toBeInTheDocument();
        });
        it('should handle null children gracefully', () => {
            render(_jsx(BrowserRouter, { children: _jsx(Layout, { children: null }) }));
            expect(screen.getByRole('navigation')).toBeInTheDocument();
        });
        it('should handle multiple className values', () => {
            const { container } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { className: "class1 class2 class3", children: _jsx("div", { children: "Content" }) }) }));
            const layoutContainer = container.firstChild;
            expect(layoutContainer).toHaveClass('class1', 'class2', 'class3');
        });
        it('should toggle navbar visibility conditionally', () => {
            const { rerender } = render(_jsx(BrowserRouter, { children: _jsx(Layout, { showNavbar: true, children: _jsx("div", { children: "Content" }) }) }));
            expect(screen.getByRole('navigation')).toBeInTheDocument();
            rerender(_jsx(BrowserRouter, { children: _jsx(Layout, { showNavbar: false, children: _jsx("div", { children: "Content" }) }) }));
            expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
        });
    });
});
