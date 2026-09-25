/* What /usher/ ships. `bun run check` builds without PUBLIC_USHER_API_URL,
   so dist/ must hold the holding page and no PWA. A second build, into a
   temporary directory with a stand-in URL, checks the live shell: manifest,
   CSP, worker scope. The worker file is checked as text because it runs
   outside the bundle. */
import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");
const dist = join(root, "dist");
/* Astro moves assets into outDir with rename(), so the scratch build must sit on the same
   filesystem as the repository; node_modules/.cache is ignored by git and always there. */
const scratch = join(root, "node_modules", ".cache");
mkdirSync(scratch, { recursive: true });
/* What `bun run check` built dist/ with. The workflow sets it once the owner has a public URL. */
const configured = process.env["PUBLIC_USHER_API_URL"]?.trim() || undefined;

/* The build must run as it does in CI: `bun test` sets NODE_ENV=test, which would turn
   import.meta.env.PROD off and drop the CSP and the worker registration. */
function buildEnv(apiUrl: string): Record<string, string> {
  const env: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) if (key !== "NODE_ENV" && value !== undefined) env[key] = value;
  env["PUBLIC_USHER_API_URL"] = apiUrl;
  return env;
}

async function read(base: string, path: string): Promise<string> {
  const file = join(base, path);
  if (!existsSync(file)) throw new Error(`${file} missing: run \`bun run build\` first`);
  return Bun.file(file).text();
}

describe("/usher/ as built by the check", () => {
  test(configured ? "is the app, pointed at the configured URL" : "is a holding page with no island, manifest or worker link", async () => {
    const page = await read(dist, "usher/index.html");
    expect(page).toContain('<html lang="pt-BR" data-register="b2c"');
    expect(page).toContain('rel="canonical" href="https://eventolivre.com/usher/"');
    if (configured) {
      expect(page).toContain('component-export="Usher"');
      expect(page).toContain(configured);
      expect(page).not.toContain("data-holding");
    } else {
      expect(page).toContain("data-holding");
      expect(page).not.toContain('component-export="Usher"');
      expect(page).not.toContain("manifest.webmanifest");
      expect(page).not.toContain("connect-src 'self' http");
    }
  });

  test("the manifest and worker are still static files scoped to /usher/", async () => {
    const manifest = JSON.parse(await read(dist, "usher/manifest.webmanifest")) as Record<string, unknown>;
    expect(manifest["start_url"]).toBe("/usher/");
    expect(manifest["scope"]).toBe("/usher/");
    expect(manifest["id"]).toBe("/usher/");
    expect(manifest["lang"]).toBe("pt-BR");
    expect(Array.isArray(manifest["icons"])).toBe(true);
    for (const icon of manifest["icons"] as ReadonlyArray<{ src: string }>) {
      expect(existsSync(join(dist, icon.src))).toBe(true);
    }
    const worker = await read(dist, "usher/sw.js");
    expect(worker).toContain('const SHELL = "/usher/"');
    expect(worker).not.toMatch(/scope:\s*["']\/["']/);
  });
});

describe("/usher/ with an API URL", () => {
  const apiUrl = "https://api.invalid/usher/";

  test("ships the island, the manifest link and a CSP that names only that origin", async () => {
    const out = mkdtempSync(join(scratch, "usher-dist-"));
    try {
      const build = Bun.spawnSync(["bunx", "astro", "build", "--outDir", out], {
        cwd: root,
        env: buildEnv(apiUrl),
      });
      expect(build.exitCode, build.stderr.toString() + build.stdout.toString()).toBe(0);
      const page = await read(out, "usher/index.html");
      expect(page).toContain('component-export="Usher"');
      expect(page).toContain('rel="manifest" href="/usher/manifest.webmanifest"');
      expect(page).toContain("http-equiv=\"Content-Security-Policy\"");
      expect(page).toContain("connect-src 'self' https://api.invalid;");
      expect(page).toContain("object-src 'none'");
      expect(page).not.toContain("data-holding");
      expect(page).toContain(apiUrl);
      /* The site's own pages must not change with the variable. */
      expect(await read(out, "index.html")).toBe(await read(dist, "index.html"));
      expect(await read(out, "en/index.html")).toBe(await read(dist, "en/index.html"));
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 60_000);

  test("a malformed URL fails the build", () => {
    const out = mkdtempSync(join(scratch, "usher-dist-"));
    try {
      const build = Bun.spawnSync(["bunx", "astro", "build", "--outDir", out], {
        cwd: root,
        env: buildEnv("not a url"),
      });
      expect(build.exitCode).not.toBe(0);
    } finally {
      rmSync(out, { recursive: true, force: true });
    }
  }, 60_000);
});
