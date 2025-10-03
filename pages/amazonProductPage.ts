import { Page } from '@playwright/test';
import { handleAmazonDialog } from '../utils/amazonUtils';

export class AmazonProductPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async addToCart() {
    await handleAmazonDialog(this.page);
    await this.page.waitForSelector('#add-to-cart-button', { timeout: 15000 });
    await this.page.click('#add-to-cart-button');
    await handleAmazonDialog(this.page); // sometimes dialog pops again
  }
}

