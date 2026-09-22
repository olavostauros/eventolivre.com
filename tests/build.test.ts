/* Runs after `astro build` (bun run check orders it so). Checks what the
   deploy will publish, not what the source says. */
import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { textStyles } from "@evento-livre/design-system/src/tokens/typography.ts";

const dist = join(import.meta.dir, "..", "dist");

async function html(path: string): Promise<string> {
  const file = join(dist, path);
  if (!existsSync(file)) throw new Error(`${file} missing: run \`bun run build\` first`);
  return Bun.file(file).text();
}

describe("built pages", () => {
  test("pt-BR at /", async () => {
    const page = await html("index.html");
    expect(page).toContain('<html lang="pt-BR"');
    expect(page).toContain('hreflang="en" href="https://eventolivre.com/en/"');
    expect(page).toContain('hreflang="x-default" href="https://eventolivre.com/"');
    expect(page).toContain('property="og:title"');
  });

  test("en at /en/", async () => {
    const page = await html("en/index.html");
    expect(page).toContain('<html lang="en"');
    expect(page).toContain('hreflang="pt-BR" href="https://eventolivre.com/"');
  });

  test("registers are set on the two audience sections only", async () => {
    const page = await html("index.html");
    expect(page.match(/data-register="b2b"/g)?.length).toBe(1);
    // <html> default plus the attendee section.
    expect(page.match(/data-register="b2c"/g)?.length).toBe(2);
  });

  test("the design system's styles made it into the bundle", async () => {
    const page = await html("index.html");
    const css = page.match(/href="(\/_astro\/[^"]+\.css)"/)?.[1];
    expect(css).toBeDefined();
    const sheet = await html(css!.slice(1));
    expect(sheet).toContain("--color-canvas");
    for (const style of Object.keys(textStyles)) {
      expect(sheet, style).toContain(`.type-${style}{`);
    }
    expect(sheet).toContain("Bricolage Grotesque");
  });
});
