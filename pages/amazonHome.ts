import { Page } from '@playwright/test';
import { handleAmazonDialog } from '../utils/amazonUtils';

export class AmazonHome {
  readonly page: Page;
  readonly url = 'https://www.amazon.in/';

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
    await handleAmazonDialog(this.page);
  }

  async searchFor(keyword: string) {
    await handleAmazonDialog(this.page);

    await this.page.fill('input#twotabsearchtextbox', keyword);
    await this.page.click('input#nav-search-submit-button');

    await this.page.waitForSelector('div.s-main-slot', { timeout: 45000 });
    await handleAmazonDialog(this.page);
  }
}
