import { Page } from '@playwright/test';
import { handleAmazonDialog } from '../utils/amazonUtils';

export class AmazonCart {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async gotoCart() {
    await this.page.click('#nav-cart');
    await handleAmazonDialog(this.page);
    await this.page.waitForSelector('.sc-list-item-content', { timeout: 30000 });
  }

  // ✅ Get all items from cart
  async getCartItems() {
    const items = this.page.locator('.sc-list-item-content');
    const count = await items.count();
    const cart: { title: string; price: number }[] = [];

    for (let i = 0; i < count; i++) {
      const title = await items.nth(i).locator('span.a-truncate-full, span.a-size-medium').first().innerText();

      let price = 0;
      if (await items.nth(i).locator('span.a-price-whole').count()) {
        const priceText = await items.nth(i).locator('span.a-price-whole').innerText();
        price = parseInt(priceText.replace(/[^\d]/g, ''), 10);
      }

      cart.push({ title: title.trim(), price });
    }

    return cart;
  }

  // ✅ Get subtotal of cart
  async getCartTotal() {
    const subtotalText = await this.page.locator('#sc-subtotal-amount-buybox .a-price-whole').innerText();
    return parseInt(subtotalText.replace(/[^\d]/g, ''), 10);
  }
}
