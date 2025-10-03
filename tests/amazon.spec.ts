import { test, expect } from '@playwright/test';
import { AmazonHome } from '../pages/amazonHome';
import { AmazonSearchResults } from '../pages/amazonSearchResults';
import { AmazonCart } from '../pages/amazonCart';

test.describe('Amazon Product Search & Cart Flow', () => {
  test('Validate product search, add to cart with business rules, and validate cart', async ({ page }) => {
    const home = new AmazonHome(page);
    const results = new AmazonSearchResults(page);
    const cart = new AmazonCart(page);

    //  Products to test
    const productsToTest = [
      { name: 'wireless mouse', keyword: 'wireless mouse' },
      { name: 'Bluetooth headset', keyword: 'Bluetooth headset' },
      { name: 'Data cable', keyword: 'Data cable' },
      { name: 'Pen drive', keyword: 'Pen drive' },
      { name: 'laptop stand', keyword: 'laptop stand' },
    ];

    // Track products we actually add
    const addedProducts: { title: string; price: number }[] = [];

    // === Main Flow ===
    for (const product of productsToTest) {
      console.log(`🔎 Searching for: ${product.name}`);

      // Always start from home page for stability
      await home.goto();
      await home.searchFor(product.name);

      // Validate results contain expected keyword
      await results.validateResultsContain(product.keyword);

      // Get first 10 products
      const topProducts = await results.getFirstTenProducts();
      console.log(`✅ Found ${topProducts.length} products for "${product.name}"`);

      // Business logic: add based on price
      for (const p of topProducts) {
        if (!p.price) continue;

        if (p.price >= 500 && p.price <= 1000) {
          console.log(`🛒 Adding ${p.title} at ₹${p.price}`);
          await results.openProductDetail(p.index);
          await results.addProductToCartFromDetail(); // default qty = 1
          addedProducts.push({ title: p.title, price: p.price });
          break; // move to next keyword
        } else if (p.price < 500) {
          console.log(`🛒 Adding ${p.title} at ₹${p.price} with qty=2`);
          await results.openProductDetail(p.index);
          await results.addProductToCartFromDetail(2); // qty = 2
          addedProducts.push({ title: p.title, price: p.price * 2 });
          break; // move to next keyword
        }
      }
    }

    // === Cart Validation ===
    await cart.gotoCart();

    const cartItems = await cart.getCartItems();
    console.log('🛒 Cart contains:', cartItems);

    // Validate cart has all added products
    for (const added of addedProducts) {
      const match = cartItems.find((c) => c.title.includes(added.title));
      expect(match).toBeTruthy();
      expect(match?.price).toBe(added.price);
    }

    // Validate total
    const expectedTotal = addedProducts.reduce((sum, p) => sum + p.price, 0);
    const actualTotal = await cart.getCartTotal();
    expect(actualTotal).toBe(expectedTotal);
  });
});
