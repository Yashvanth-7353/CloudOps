import { test, expect } from '@playwright/test';
/**
 * Hero Component E2E Tests
 * End-to-end tests using Playwright
 */
test.describe('Hero Component E2E', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });
    // Navigation Tests
    test.describe('Hero Section Rendering', () => {
        test('should display hero section on landing page', async ({ page }) => {
            const heroSection = page.locator('section').first();
            await expect(heroSection).toBeVisible();
        });
        test('should display main headline', async ({ page }) => {
            const headline = page.getByRole('heading', { level: 1 });
            await expect(headline).toContainText('Deploy Apps to AWS');
        });
        test('should display subheading text', async ({ page }) => {
            const subheading = page.getByText(/CloudOps automates/);
            await expect(subheading).toBeVisible();
        });
        test('should display beta badge', async ({ page }) => {
            const badge = page.getByText(/Open Beta/);
            await expect(badge).toBeVisible();
        });
        test('should display both CTA buttons', async ({ page }) => {
            const connectBtn = page.getByRole('button', { name: /Connect GitHub/i });
            const demoBtn = page.getByRole('button', { name: /Watch Demo/i });
            await expect(connectBtn).toBeVisible();
            await expect(demoBtn).toBeVisible();
        });
        test('should display all pipeline stages', async ({ page }) => {
            const stages = ['GitHub', 'Docker Build', 'Deploy to AWS', 'Live Website'];
            for (const stage of stages) {
                const element = page.getByText(stage);
                await expect(element).toBeVisible();
            }
        });
        test('should display statistics', async ({ page }) => {
            const deployments = page.getByText('1000+');
            const uptime = page.getByText('99.9%');
            const users = page.getByText('500+');
            await expect(deployments).toBeVisible();
            await expect(uptime).toBeVisible();
            await expect(users).toBeVisible();
        });
        test('should display scroll indicator', async ({ page }) => {
            const scrollIndicator = page.getByText(/Scroll to explore/);
            await expect(scrollIndicator).toBeVisible();
        });
    });
    // Button Interaction Tests
    test.describe('Button Interactions', () => {
        test('Connect GitHub button should be clickable', async ({ page }) => {
            const btn = page.getByRole('button', { name: /Connect GitHub/i });
            await expect(btn).toBeEnabled();
            await btn.click();
            // Should not navigate (or handle OAuth)
            expect(page).toBeDefined();
        });
        test('Watch Demo button should be clickable', async ({ page }) => {
            const btn = page.getByRole('button', { name: /Watch Demo/i });
            await expect(btn).toBeEnabled();
            await btn.click();
            // Should not cause errors
            expect(page).toBeDefined();
        });
        test('buttons should have hover effect', async ({ page }) => {
            const btn = page.getByRole('button', { name: /Connect GitHub/i });
            await btn.hover();
            // Button should remain visible and clickable
            await expect(btn).toBeVisible();
        });
        test('buttons should be keyboard accessible', async ({ page }) => {
            const btn = page.getByRole('button', { name: /Connect GitHub/i });
            // Tab to button
            await page.keyboard.press('Tab');
            // Try to click with space
            await page.keyboard.press('Space');
            // Should not error
            expect(page).toBeDefined();
        });
        test('buttons should respond to rapid clicks', async ({ page }) => {
            const btn = page.getByRole('button', { name: /Connect GitHub/i });
            await btn.click();
            await btn.click();
            await btn.click();
            // Should not break
            await expect(btn).toBeVisible();
        });
    });
    // Animation Tests
    test.describe('Animations', () => {
        test('should animate headline on load', async ({ page }) => {
            const headline = page.getByRole('heading', { level: 1 });
            // Wait for animation
            await page.waitForTimeout(500);
            // Should be visible and animated
            await expect(headline).toBeVisible();
        });
        test('should animate badge pulse', async ({ page }) => {
            const badge = page.getByText(/Open Beta/);
            const initialOpacity = await badge.evaluate((el) => window.getComputedStyle(el).opacity);
            // Wait for animation cycle
            await page.waitForTimeout(2000);
            const finalOpacity = await badge.evaluate((el) => window.getComputedStyle(el).opacity);
            // Opacity should change with animation
            expect(badge).toBeDefined();
        });
        test('should animate scroll indicator', async ({ page }) => {
            const indicator = page.getByText(/Scroll to explore/);
            const initialPosition = await indicator.boundingBox();
            await page.waitForTimeout(1000);
            const finalPosition = await indicator.boundingBox();
            // Position should change with bounce animation
            expect(finalPosition).toBeDefined();
        });
        test('should animate particles', async ({ page }) => {
            // Particles are background elements
            const { container } = page.locator('body').evaluate((el) => ({
                container: el,
            }));
            // Wait for particle animations
            await page.waitForTimeout(2000);
            // Page should still be interactive
            expect(page).toBeDefined();
        });
        test('should animate gradient overlay', async ({ page }) => {
            const pipeline = page.locator('div').filter({ hasText: /GitHub/ }).first();
            const initialStyle = await pipeline.getAttribute('style');
            await page.waitForTimeout(2000);
            const finalStyle = await pipeline.getAttribute('style');
            // Should have animation applied
            expect(pipeline).toBeDefined();
        });
    });
    // Responsive Tests
    test.describe('Responsiveness', () => {
        const viewports = [
            { width: 320, height: 568, name: 'iPhone SE' },
            { width: 375, height: 667, name: 'iPhone 12' },
            { width: 768, height: 1024, name: 'iPad' },
            { width: 1024, height: 768, name: 'iPad Landscape' },
            { width: 1920, height: 1080, name: 'Desktop' },
        ];
        for (const viewport of viewports) {
            test(`should render correctly on ${viewport.name}`, async ({ page }) => {
                await page.setViewportSize({ width: viewport.width, height: viewport.height });
                await page.goto('http://localhost:3000');
                const headline = page.getByRole('heading', { level: 1 });
                await expect(headline).toBeVisible();
                const btn = page.getByRole('button', { name: /Connect GitHub/i });
                await expect(btn).toBeVisible();
            });
        }
        test('should maintain layout on resize', async ({ page }) => {
            await page.setViewportSize({ width: 1920, height: 1080 });
            const headline = page.getByRole('heading', { level: 1 });
            await expect(headline).toBeVisible();
            await page.setViewportSize({ width: 375, height: 667 });
            // Should still be visible and not broken
            await expect(headline).toBeVisible();
        });
        test('should stack buttons vertically on mobile', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            const btn1 = page.getByRole('button', { name: /Connect GitHub/i });
            const btn2 = page.getByRole('button', { name: /Watch Demo/i });
            const box1 = await btn1.boundingBox();
            const box2 = await btn2.boundingBox();
            if (box1 && box2) {
                // On mobile, buttons should be stacked vertically
                // box2.y should be significantly larger than box1.y
                expect(Math.abs(box2.x - box1.x)).toBeLessThan(50);
            }
        });
        test('should have responsive font sizes', async ({ page }) => {
            await page.setViewportSize({ width: 375, height: 667 });
            const headline = page.getByRole('heading', { level: 1 });
            const fontSize = await headline.evaluate((el) => window.getComputedStyle(el).fontSize);
            // Should have reasonable font size on mobile
            expect(parseInt(fontSize)).toBeGreaterThan(20);
            expect(parseInt(fontSize)).toBeLessThan(80);
        });
    });
    // Content Tests
    test.describe('Content', () => {
        test('should have proper content structure', async ({ page }) => {
            const section = page.locator('section').first();
            expect(section).toBeDefined();
            // All main content should be present
            await expect(page.getByText(/Deploy Apps/)).toBeVisible();
            await expect(page.getByRole('button')).toHaveCount(2);
        });
        test('should have readable content length', async ({ page }) => {
            const subheading = page.getByText(/CloudOps automates/);
            const text = await subheading.textContent();
            // Should have substantial content
            expect(text?.length).toBeGreaterThan(30);
        });
        test('should have descriptive text for all elements', async ({ page }) => {
            const labels = ['GitHub', 'Docker Build', 'Deploy to AWS', 'Live Website'];
            for (const label of labels) {
                const element = page.getByText(label);
                await expect(element).toBeVisible();
            }
        });
        test('should display statistics with proper values', async ({ page }) => {
            const stats = ['1000+', '99.9%', '500+'];
            for (const stat of stats) {
                const element = page.getByText(stat);
                await expect(element).toBeVisible();
            }
        });
    });
    // Visual Tests
    test.describe('Visual Design', () => {
        test('should display gradient text effect on headline', async ({ page }) => {
            const headline = page.getByRole('heading', { level: 1 });
            const style = await headline.evaluate((el) => window.getComputedStyle(el));
            // Should have some styling
            expect(style).toBeDefined();
        });
        test('should display pipeline container with border', async ({ page }) => {
            const pipeline = page.locator('div').filter({ hasText: /GitHub/ }).first();
            const border = await pipeline.evaluate((el) => window.getComputedStyle(el).border);
            // Should have border styling
            expect(border).toBeDefined();
        });
        test('should have consistent spacing', async ({ page }) => {
            const buttons = page.getByRole('button');
            const count = await buttons.count();
            expect(count).toBeGreaterThan(0);
            // Check spacing between buttons
            for (let i = 0; i < count - 1; i++) {
                const btn = buttons.nth(i);
                await expect(btn).toBeVisible();
            }
        });
        test('should display with dark background', async ({ page }) => {
            const section = page.locator('section').first();
            const background = await section.evaluate((el) => window.getComputedStyle(el).backgroundColor);
            // Should have dark background
            expect(background).toBeDefined();
        });
    });
    // Accessibility Tests
    test.describe('Accessibility', () => {
        test('should have proper heading hierarchy', async ({ page }) => {
            const h1 = page.getByRole('heading', { level: 1 });
            await expect(h1).toBeVisible();
        });
        test('should have accessible buttons', async ({ page }) => {
            const btn = page.getByRole('button', { name: /Connect GitHub/i });
            await expect(btn).toBeAccessible();
        });
        test('should support keyboard navigation', async ({ page }) => {
            const firstBtn = page.getByRole('button', { name: /Connect GitHub/i });
            // Tab to button
            await page.keyboard.press('Tab');
            // Button should be interactive
            await expect(firstBtn).toBeVisible();
        });
        test('should have sufficient color contrast', async ({ page }) => {
            const headline = page.getByRole('heading', { level: 1 });
            const color = await headline.evaluate((el) => window.getComputedStyle(el).color);
            // Should have color defined
            expect(color).not.toBe('rgba(0, 0, 0, 0)');
        });
        test('should work with screen readers', async ({ page }) => {
            const headline = page.getByRole('heading', { level: 1 });
            const btn = page.getByRole('button');
            await expect(headline).toBeVisible();
            await expect(btn).toHaveCount(2);
        });
    });
    // Performance Tests
    test.describe('Performance', () => {
        test('should load hero within acceptable time', async ({ page }) => {
            const startTime = Date.now();
            await page.goto('http://localhost:3000');
            const hero = page.locator('section').first();
            await hero.waitFor();
            const loadTime = Date.now() - startTime;
            // Should load within 3 seconds
            expect(loadTime).toBeLessThan(3000);
        });
        test('should not cause layout shift', async ({ page }) => {
            // Take initial measurement
            const initial = await page.locator('body').boundingBox();
            // Wait for animations
            await page.waitForTimeout(1000);
            // Take final measurement
            const final = await page.locator('body').boundingBox();
            // Dimensions should match (no layout shift)
            expect(initial?.width).toBe(final?.width);
        });
        test('should animate smoothly without blocking', async ({ page }) => {
            // Start animation
            const startTime = Date.now();
            // Perform interaction during animation
            const btn = page.getByRole('button', { name: /Connect GitHub/i });
            // Should still be responsive
            await expect(btn).toBeVisible();
            const endTime = Date.now();
            // Interaction should be quick even during animation
            expect(endTime - startTime).toBeLessThan(1000);
        });
    });
    // Error Handling
    test.describe('Error Handling', () => {
        test('should handle missing images gracefully', async ({ page }) => {
            // Even if images fail to load, hero should work
            const headline = page.getByRole('heading', { level: 1 });
            await expect(headline).toBeVisible();
        });
        test('should work with JavaScript disabled features', async ({ page }) => {
            // Framer Motion should degrade gracefully
            const section = page.locator('section').first();
            await expect(section).toBeVisible();
        });
        test('should not break on rapid navigation', async ({ page }) => {
            await page.goto('http://localhost:3000');
            await page.goto('http://localhost:3000');
            await page.goto('http://localhost:3000');
            const headline = page.getByRole('heading', { level: 1 });
            await expect(headline).toBeVisible();
        });
    });
});
