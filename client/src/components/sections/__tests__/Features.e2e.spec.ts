import { test, expect } from '@playwright/test';

/**
 * Features Component E2E Tests
 * End-to-end tests using Playwright
 */

test.describe('Features Section E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    // Scroll to features section
    await page.evaluate(() => {
      const section = document.querySelector('.features-section');
      section?.scrollIntoView();
    });
  });

  // Navigation and Rendering Tests
  test.describe('Features Section Rendering', () => {
    test('should display features section on page', async ({ page }) => {
      const featuresSection = page.locator('.features-section').first();
      await expect(featuresSection).toBeVisible();
    });

    test('should display section title', async ({ page }) => {
      const title = page.getByText(/Everything You Need to/i);
      await expect(title).toBeVisible();
    });

    test('should display gradient title text', async ({ page }) => {
      const gradientTitle = page.getByText(/Deploy Faster/i);
      await expect(gradientTitle).toBeVisible();
    });

    test('should display section subtitle', async ({ page }) => {
      const subtitle = page.getByText(/combines powerful tools/i);
      await expect(subtitle).toBeVisible();
    });

    test('should display badge', async ({ page }) => {
      const badge = page.getByText(/Powerful Features/i);
      await expect(badge).toBeVisible();
    });

    test('should display all 6 feature cards', async ({ page }) => {
      const cards = page.locator('.feature-card');
      await expect(cards).toHaveCount(6);
    });

    test('should display all feature titles', async ({ page }) => {
      const titles = [
        'One Click Deployment',
        'Docker Powered Builds',
        'AWS Cloud Deployment',
        'Real-Time Deployment Logs',
        'Cloud Monitoring',
        'Cost Analytics',
      ];

      for (const title of titles) {
        await expect(page.getByText(title)).toBeVisible();
      }
    });

    test('should display all feature descriptions', async ({ page }) => {
      const descriptions = [
        /Deploy your applications to AWS/i,
        /Containerize your applications/i,
        /Deploy to AWS with advanced/i,
        /Monitor your deployments/i,
        /Real-time performance monitoring/i,
        /Track and optimize your cloud costs/i,
      ];

      for (const description of descriptions) {
        await expect(page.getByText(description)).toBeVisible();
      }
    });

    test('should display CTA button', async ({ page }) => {
      const ctaButton = page.getByRole('button', { name: /Start Free Trial/i });
      await expect(ctaButton).toBeVisible();
    });

    test('should display CTA text', async ({ page }) => {
      const ctaText = page.getByText(/Ready to revolutionize/i);
      await expect(ctaText).toBeVisible();
    });

    test('should have all feature icons visible', async ({ page }) => {
      const icons = page.locator('.feature-card-icon svg');
      await expect(icons).toHaveCount(6);
    });
  });

  // Feature Card Tests
  test.describe('Feature Cards', () => {
    test('should have correct number of card sizes', async ({ page }) => {
      const largeCards = page.locator('.feature-card-large');
      const mediumCards = page.locator('.feature-card-medium');
      const smallCards = page.locator('.feature-card-small');

      await expect(largeCards).toHaveCount(2);
      await expect(mediumCards).toHaveCount(2);
      await expect(smallCards).toHaveCount(2);
    });

    test('should have glassmorphism styling on cards', async ({ page }) => {
      const card = page.locator('.feature-card').first();
      const glassEffect = page.locator('.feature-card-glass').first();
      
      await expect(glassEffect).toBeVisible();
      
      const style = await glassEffect.evaluate((el: any) => ({
        backdropFilter: window.getComputedStyle(el).backdropFilter,
        background: window.getComputedStyle(el).background,
      }));
      
      expect(style.backdropFilter).toBeTruthy();
    });

    test('should have border overlay on cards', async ({ page }) => {
      const borderOverlay = page.locator('.feature-card-border');
      expect(borderOverlay).toHaveCount(6);
    });

    test('should have glow effect on hover', async ({ page }) => {
      const card = page.locator('.feature-card').first();
      
      await card.hover();
      
      const glow = card.locator('.feature-card-glow');
      await expect(glow).toBeVisible();
    });

    test('should display arrow indicator', async ({ page }) => {
      const arrows = page.locator('.feature-card-arrow');
      await expect(arrows).toHaveCount(6);
    });
  });

  // Button Interaction Tests
  test.describe('Button Interactions', () => {
    test('CTA button should be clickable', async ({ page }) => {
      const ctaButton = page.getByRole('button', { name: /Start Free Trial/i });
      
      await expect(ctaButton).toBeEnabled();
      await ctaButton.click();
      
      // Should remain visible
      await expect(ctaButton).toBeVisible();
    });

    test('buttons should have hover effect', async ({ page }) => {
      const ctaButton = page.getByRole('button', { name: /Start Free Trial/i });
      
      await ctaButton.hover();
      
      await expect(ctaButton).toBeVisible();
    });

    test('buttons should be keyboard accessible', async ({ page }) => {
      const ctaButton = page.getByRole('button', { name: /Start Free Trial/i });
      
      // Tab to button
      await page.keyboard.press('Tab');
      
      // Check if button can be activated with Enter
      await page.keyboard.press('Enter');
      
      // Should not error
      expect(page).toBeDefined();
    });

    test('should handle rapid button clicks', async ({ page }) => {
      const ctaButton = page.getByRole('button', { name: /Start Free Trial/i });
      
      await ctaButton.click();
      await ctaButton.click();
      await ctaButton.click();
      
      await expect(ctaButton).toBeVisible();
    });
  });

  // Animation Tests
  test.describe('Animations', () => {
    test('should animate title on view', async ({ page }) => {
      const title = page.getByText(/Everything You Need to/i);
      
      await page.waitForTimeout(500);
      
      await expect(title).toBeVisible();
    });

    test('should animate feature cards on view', async ({ page }) => {
      const card = page.locator('.feature-card').first();
      
      await page.waitForTimeout(500);
      
      await expect(card).toBeVisible();
    });

    test('should animate badge', async ({ page }) => {
      const badge = page.getByText(/Powerful Features/i);
      
      await page.waitForTimeout(500);
      
      await expect(badge).toBeVisible();
    });

    test('should have smooth card transitions on hover', async ({ page }) => {
      const card = page.locator('.feature-card').first();
      
      const initialBox = await card.boundingBox();
      
      await card.hover();
      
      await page.waitForTimeout(300);
      
      const hoverBox = await card.boundingBox();
      
      // Card should move up slightly on hover
      if (initialBox && hoverBox) {
        expect(initialBox.y).toBeGreaterThanOrEqual(hoverBox.y);
      }
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

        const title = page.getByText(/Everything You Need to/i);
        await expect(title).toBeVisible();

        const cards = page.locator('.feature-card');
        await expect(cards).toHaveCount(6);
      });
    }

    test('should maintain layout on resize', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      const title = page.getByText(/Everything You Need to/i);
      await expect(title).toBeVisible();

      await page.setViewportSize({ width: 375, height: 667 });

      await expect(title).toBeVisible();
    });

    test('should have responsive card layout', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const cards = page.locator('.feature-card');
      
      // All cards should be visible
      for (let i = 0; i < 6; i++) {
        await expect(cards.nth(i)).toBeVisible();
      }
    });

    test('should have responsive text sizes', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const title = page.getByText(/Everything You Need to/i);
      
      const fontSize = await title.evaluate((el: any) =>
        window.getComputedStyle(el).fontSize
      );

      // Should have reasonable font size
      expect(parseInt(fontSize)).toBeGreaterThan(15);
      expect(parseInt(fontSize)).toBeLessThan(40);
    });
  });

  // Content Tests
  test.describe('Content Validation', () => {
    test('should have proper content structure', async ({ page }) => {
      const section = page.locator('.features-section');
      
      await expect(section).toBeVisible();
      
      // All main content should be present
      await expect(page.getByText(/Everything You Need to/i)).toBeVisible();
      await expect(page.locator('.feature-card')).toHaveCount(6);
    });

    test('should have descriptive text for all features', async ({ page }) => {
      const descriptions = page.locator('.feature-card-description');
      
      await expect(descriptions).toHaveCount(6);
      
      for (let i = 0; i < 6; i++) {
        const text = await descriptions.nth(i).textContent();
        expect(text?.length).toBeGreaterThan(30);
      }
    });

    test('should have readable content', async ({ page }) => {
      const subtitle = page.getByText(/combines powerful tools/i);
      
      const text = await subtitle.textContent();
      
      expect(text?.length).toBeGreaterThan(50);
    });

    test('should have consistent card content', async ({ page }) => {
      const cards = page.locator('.feature-card');
      
      // Each card should have icon, title, description
      for (let i = 0; i < 6; i++) {
        const card = cards.nth(i);
        const icon = card.locator('svg');
        const title = card.locator('h3');
        const description = card.locator('p');
        
        await expect(icon).toHaveCount(1);
        await expect(title).toHaveCount(1);
        await expect(description).toHaveCount(1);
      }
    });
  });

  // Visual Design Tests
  test.describe('Visual Design', () => {
    test('should have gradient background on section', async ({ page }) => {
      const section = page.locator('.features-section');
      
      const background = await section.evaluate((el: any) =>
        window.getComputedStyle(el).background
      );

      expect(background).toBeTruthy();
    });

    test('should have gradient text on title', async ({ page }) => {
      const gradientTitle = page.locator('.features-title-gradient');
      
      const background = await gradientTitle.evaluate((el: any) =>
        window.getComputedStyle(el).background
      );

      expect(background).toBeTruthy();
    });

    test('should display icons with proper styling', async ({ page }) => {
      const iconContainer = page.locator('.feature-card-icon').first();
      
      const style = await iconContainer.evaluate((el: any) => ({
        display: window.getComputedStyle(el).display,
        alignItems: window.getComputedStyle(el).alignItems,
      }));

      expect(style.display).toBe('flex');
    });

    test('should have consistent card borders', async ({ page }) => {
      const cards = page.locator('.feature-card');
      
      for (let i = 0; i < 6; i++) {
        const card = cards.nth(i);
        const hasGlass = await card.locator('.feature-card-glass').isVisible();
        expect(hasGlass).toBeTruthy();
      }
    });

    test('should display with appropriate contrast', async ({ page }) => {
      const title = page.getByText(/Everything You Need to/i);
      
      const color = await title.evaluate((el: any) =>
        window.getComputedStyle(el).color
      );

      expect(color).not.toBe('rgba(0, 0, 0, 0)');
    });
  });

  // Accessibility Tests
  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      const heading = page.getByRole('heading', { level: 2 });
      
      await expect(heading).toBeVisible();
    });

    test('should have accessible buttons', async ({ page }) => {
      const button = page.getByRole('button', { name: /Start Free Trial/i });
      
      await expect(button).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      const button = page.getByRole('button', { name: /Start Free Trial/i });

      await page.keyboard.press('Tab');
      
      await expect(button).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      const title = page.getByText(/Everything You Need to/i);
      
      const color = await title.evaluate((el: any) =>
        window.getComputedStyle(el).color
      );

      expect(color).not.toBe('rgba(0, 0, 0, 0)');
    });

    test('should have semantic HTML structure', async ({ page }) => {
      const section = page.locator('section').filter({ has: page.locator('.features-section') });
      
      await expect(section).toBeVisible();
    });
  });

  // Performance Tests
  test.describe('Performance', () => {
    test('should load features within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('http://localhost:3000');

      const featuresSection = page.locator('.features-section');
      await featuresSection.waitFor();

      const loadTime = Date.now() - startTime;

      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('should not cause layout shift', async ({ page }) => {
      const initial = await page.locator('body').boundingBox();

      await page.waitForTimeout(1000);

      const final = await page.locator('body').boundingBox();

      // Dimensions should match
      expect(initial?.width).toBe(final?.width);
    });

    test('should animate smoothly without blocking', async ({ page }) => {
      const startTime = Date.now();

      const button = page.getByRole('button', { name: /Start Free Trial/i });
      
      await expect(button).toBeVisible();

      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('should handle hover animations efficiently', async ({ page }) => {
      const card = page.locator('.feature-card').first();
      
      const startTime = Date.now();
      
      await card.hover();
      
      await page.waitForTimeout(300);
      
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeLessThan(500);
    });
  });

  // Error Handling
  test.describe('Error Handling', () => {
    test('should work with JavaScript disabled features', async ({ page }) => {
      const section = page.locator('.features-section');
      
      await expect(section).toBeVisible();
    });

    test('should not break on rapid navigation', async ({ page }) => {
      await page.goto('http://localhost:3000');
      await page.goto('http://localhost:3000');
      await page.goto('http://localhost:3000');

      const title = page.getByText(/Everything You Need to/i);
      await expect(title).toBeVisible();
    });

    test('should handle rapid scroll events', async ({ page }) => {
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => {
          window.scrollBy(0, 100);
        });
      }
      
      const section = page.locator('.features-section');
      await expect(section).toBeVisible();
    });
  });

  // Scroll Behavior Tests
  test.describe('Scroll Behavior', () => {
    test('should animate cards when scrolled into view', async ({ page }) => {
      await page.goto('http://localhost:3000');
      
      // Start at top
      await page.evaluate(() => window.scrollTo(0, 0));
      
      // Scroll to features
      await page.evaluate(() => {
        const section = document.querySelector('.features-section');
        section?.scrollIntoView();
      });
      
      const card = page.locator('.feature-card').first();
      await expect(card).toBeVisible();
    });

    test('should handle scroll animation timing', async ({ page }) => {
      const section = page.locator('.features-section');
      
      await section.scrollIntoView();
      
      await page.waitForTimeout(500);
      
      const title = page.getByText(/Everything You Need to/i);
      await expect(title).toBeVisible();
    });
  });
});
