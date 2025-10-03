import { Page, expect } from '@playwright/test';
import { handleAmazonDialog } from '../utils/amazonUtils';

export class AmazonSearchResults {
  constructor(private page: Page) {}

  async validateResultsContain(keyword: string) {
    await this.page.waitForSelector('div.s-main-slot');
    const titles = await this.page.locator('div.s-main-slot h2 a span').allTextContents();

    for (const title of titles.slice(0, 10)) {
      expect(title.toLowerCase()).toContain(keyword.toLowerCase());
    }
  }

  async getFirstTenProducts() {
    await this.page.waitForSelector('div.s-main-slot div[data-component-type="s-search-result"]');

    const products = await this.page.locator('div.s-main-slot div[data-component-type="s-search-result"]').all();
    const productData: { title: string; price: number | null; index: number }[] = [];

    for (let i = 0; i < Math.min(10, products.length); i++) {
      const product = products[i];
      const title = await product.locator('h2 a span').innerText();

      const whole = await product.locator('span.a-price-whole').first().textContent().catch(() => null);
      const fraction = await product.locator('span.a-price-fraction').first().textContent().catch(() => null);

      let price: number | null = null;
      if (whole) {
        price = parseInt(whole.replace(/[^\d]/g, ''));
        if (fraction) price = parseFloat(`${price}.${fraction}`);
      }

      productData.push({ title: title.trim(), price, index: i });
    }

    return productData;
  }

  async openProductDetail(index: number) {
    const product = this.page.locator('div.s-main-slot div[data-component-type="s-search-result"]').nth(index);
    await product.locator('h2 a').click();
    await this.page.waitForLoadState('domcontentloaded');
    await handleAmazonDialog(this.page);
  }

  async addProductToCartFromDetail(quantity: number = 1) {
    if (quantity > 1 && await this.page.locator('#quantity').isVisible()) {
      await this.page.selectOption('#quantity', quantity.toString());
    }

    if (await this.page.locator('#add-to-cart-button').isVisible()) {
      await this.page.locator('#add-to-cart-button').click();
    }
  }
}
