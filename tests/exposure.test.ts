/* Runs after `astro build` (bun run check orders it so). Fails when the
   tracked tree or dist/ carries something CYBERSECURITY.md §2 keeps out of
   this public repository: a private network address or host name, a
   container registry path, a connection string, a credential shape, a word
   for how the catalogue is gathered, an e-mail other than the site's contact
   address, or one of a few internal names. Those names are stored as the
   SHA-256 of the lowercase word so this file does not spell them out
   (discretion, not secrecy; add one with `printf %s 'word' | sha256sum`).
   The lists are short on purpose: the rule is the document, this is the part
   a machine can check. Widening a list is routine; narrowing one is its own
   commit that says why. */
import { describe, expect, test } from "bun:test";
import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { copy } from "../src/copy/index.ts";

const root = join(import.meta.dir, "..");
const self = relative(root, import.meta.path);
const binary = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico", ".woff", ".woff2", ".ttf", ".otf"]);

const patterns: ReadonlyArray<readonly [string, RegExp]> = [
  ["private network address (CGNAT range)", /\b100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d{1,3}\.\d{1,3}\b/],
  ["private network address", /\b(10\.\d{1,3}|192\.168|172\.(1[6-9]|2\d|3[01]))\.\d{1,3}\.\d{1,3}\b/],
  ["private network host name", /\b[a-z0-9-]+\.ts\.net\b/i],
  ["container registry path", /\bghcr\.io\b/i],
  ["connection string", /\b(postgres(ql)?|redis|mysql|mongodb(\+srv)?):\/\//i],
  ["ssh command with a port", /\bssh\b[^\n]*\s-p\s*\d+/],
  ["internal service URL with a port", /https?:\/\/[^\s"'<>]+:(2222|3000|5432|6379|8000)\b/i],
  ["private key", /BEGIN [A-Z ]*PRIVATE KEY/],
  ["GitHub token", /\b(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})/],
  ["Anthropic key", /\bsk-ant-[A-Za-z0-9_-]{10,}/],
  ["AWS key id", /\bAKIA[0-9A-Z]{16}\b/],
  ["a word for how the catalogue is gathered", /\b(crawl(er|ers|ed|ing|s)?|scrap(e|er|ers|ed|ing)s?)\b/i],
];

// SHA-256 of lowercase internal names (see the header). No labels on purpose.
const hashed: ReadonlySet<string> = new Set([
  "08584dfcca8c35f6def3737d6db689bf38c0ab6c955fc7aafe86349c5c143509",
  "cda118b287cafd07ea40744879e67054a97615df5b47ea5addbc9f41749b12b5",
  "fd6b6dc73b6183a036d01ffec2ff682165e4382eb1028b71b59985359e68fcf7",
  "bcdf8c5ea6eb402151907e04d07f9d18b067a8602f4e9e22f8207c0c6eef5f11",
  "ea090c84799e6e85c254d27eac3d77983d2afe14b6a51dd65d8d4ef77281b7a3",
  "7a5e6b5900f72fdbcc544e32669e7e7befcee0dc8d30eadeff8767676ebe869a",
  "4dc88d3d5dbe7620941bb48d2a56bc1b33bcf927938d7847a4cd8648f5237da8",
  "ad34d3ba4efb0414cd6eeba7098b26587b3ac3cfb3700f6653a1acb7b4484c8f",
  "2f7eff350df5571e2f3a106b29bfb5ce8ebbdbc722c0f0d8d491a59099b0d1c6",
  "77ebfe9993f116e089f21a982b4afcb67e3761529a29b52d5c88c65b467514e4",
]);

const allowedEmails = new Set(Object.values(copy).map((c) => c.contact.email.toLowerCase()));
const emailPattern = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi;

function sha256(word: string): string {
  return new Bun.CryptoHasher("sha256").update(word).digest("hex");
}

/* Tokens keep underscores so a snake_case name matches whole, and each
   underscore part is checked too so a prefixed variable name still matches. */
function hashedTokenIn(line: string): string | undefined {
  for (const token of line.toLowerCase().split(/[^a-z0-9_]+/)) {
    if (!token) continue;
    const parts = token.includes("_") ? [token, ...token.split("_").filter(Boolean)] : [token];
    for (const part of parts) if (hashed.has(sha256(part))) return part;
  }
  return undefined;
}

function findings(file: string, text: string, emails: boolean): string[] {
  const out: string[] = [];
  text.split("\n").forEach((line, i) => {
    const at = `${file}:${i + 1}`;
    for (const [label, re] of patterns) if (re.test(line)) out.push(`${at}: ${label}`);
    const name = hashedTokenIn(line);
    if (name !== undefined) out.push(`${at}: internal name (${"*".repeat(name.length)})`);
    if (emails) {
      for (const email of line.match(emailPattern) ?? []) {
        if (!allowedEmails.has(email.toLowerCase())) out.push(`${at}: e-mail other than the contact address`);
      }
    }
  });
  return out;
}

async function scan(files: readonly string[], base: string, emails: boolean): Promise<string[]> {
  const out: string[] = [];
  for (const file of files) {
    if (file === self || binary.has(extname(file).toLowerCase())) continue;
    const path = join(base, file);
    if (!existsSync(path) || statSync(path).isDirectory()) continue;
    out.push(...findings(file, await Bun.file(path).text(), emails));
  }
  return out;
}

function tracked(): string[] {
  const git = Bun.spawnSync(["git", "ls-files", "-z"], { cwd: root });
  if (git.exitCode !== 0) throw new Error(`git ls-files failed: ${git.stderr.toString()}`);
  return git.stdout.toString().split("\0").filter(Boolean);
}

function walk(dir: string, base = dir): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    return statSync(path).isDirectory() ? walk(path, base) : [relative(base, path)];
  });
}

const dist = join(root, "dist");

describe("exposure", () => {
  test("the tracked tree carries nothing CYBERSECURITY.md §2 keeps out", async () => {
    expect(await scan(tracked(), root, false)).toEqual([]);
  });

  test("the built site carries nothing CYBERSECURITY.md §2 keeps out", async () => {
    if (!existsSync(dist)) throw new Error(`${dist} missing: run \`bun run build\` first`);
    expect(await scan(walk(dist), dist, true)).toEqual([]);
  });

  test("the hashed names still resolve to themselves", () => {
    expect(hashed.size).toBeGreaterThan(0);
    for (const h of hashed) expect(h).toMatch(/^[0-9a-f]{64}$/);
    expect(hashedTokenIn("a harmless line about the page")).toBeUndefined();
  });
});
