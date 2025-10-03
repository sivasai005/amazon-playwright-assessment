import { Page } from '@playwright/test';

//  Handle the Amazon "ship to location" dialog everywhere
export async function handleAmazonDialog(page: Page) {
  try {
    const dismissBtn = page.locator('input.a-button-input[data-action-type="DISMISS"]');
    if (await dismissBtn.isVisible({ timeout: 3000 })) {
      await dismissBtn.click();
      console.log('Amazon location dialog dismissed');
    }
  } catch {
    // No dialog found → safe to ignore
  }
}
