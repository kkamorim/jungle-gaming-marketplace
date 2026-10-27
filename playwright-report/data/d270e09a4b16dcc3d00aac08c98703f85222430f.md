# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: visual.spec.ts >> home visual baseline
- Location: tests\visual.spec.ts:3:1

# Error details

```
Error: expect(page).toHaveScreenshot(expected) failed

  44643 pixels (ratio 0.18 of all image pixels) are different.

  Snapshot: home.png

Call log:
  - Expect "toHaveScreenshot(home.png)" with timeout 5000ms
    - verifying given screenshot expectation
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - 44643 pixels (ratio 0.18 of all image pixels) are different.
  - waiting 100ms before taking screenshot
  - taking page screenshot
    - disabled all CSS animations
  - waiting for fonts to load...
  - fonts loaded
  - captured a stable screenshot
  - 44643 pixels (ratio 0.18 of all image pixels) are different.

```

# Page snapshot

```yaml
- generic [ref=e4]:
  - strong [ref=e5]: Something went wrong!
  - button "Show Error" [ref=e6] [cursor=pointer]
```

# Test source

```ts
  1  | ﻿import { expect, test } from '@playwright/test';
  2  | 
  3  | test('home visual baseline', async ({ page }) => {
  4  |   await page.goto('/');
  5  |   await page.waitForLoadState('networkidle');
  6  |   await page.waitForTimeout(800);
> 7  |   await expect(page).toHaveScreenshot('home.png', { fullPage: false });
     |                      ^ Error: expect(page).toHaveScreenshot(expected) failed
  8  | });
  9  | 
  10 | 
  11 | 
```