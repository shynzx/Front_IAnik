import { expect, test } from "@playwright/test";

test("las pantallas públicas no muestran el sidebar", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveURL(/\/login/);
  await expect(page.locator("aside")).toHaveCount(0);
});

test("limpia una URL inexistente", async ({ page }) => {
  await page.goto("/ruta-que-no-existe");
  await expect(page).toHaveURL("http://127.0.0.1:3000/");
});
