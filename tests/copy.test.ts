import { describe, expect, test } from "bun:test";
import { copy, locales } from "../src/copy/index.ts";
import { usherPtBR } from "../src/copy/usher.ts";

type Tree = { readonly [key: string]: unknown };

function leaves(value: unknown, prefix = ""): Array<[string, unknown]> {
  if (Array.isArray(value)) return value.flatMap((item, i) => leaves(item, `${prefix}[${i}]`));
  if (value !== null && typeof value === "object") {
    return Object.entries(value as Tree).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  }
  return [[prefix, value]];
}

const paths = (value: unknown) => leaves(value).map(([path]) => path).sort();

describe("copy", () => {
  const reference = paths(copy["pt-BR"]);

  for (const locale of locales) {
    test(`${locale} has the same keys as pt-BR`, () => {
      expect(paths(copy[locale])).toEqual(reference);
    });

    test(`${locale} has no empty strings`, () => {
      for (const [path, value] of leaves(copy[locale])) {
        expect(typeof value, path).toBe("string");
        expect((value as string).trim().length, path).toBeGreaterThan(0);
      }
    });
  }

  test("the Usher app's strings are all present", () => {
    for (const [path, value] of leaves(usherPtBR)) {
      expect(typeof value, path).toBe("string");
      expect((value as string).trim().length, path).toBeGreaterThan(0);
    }
  });

  test("the contact address is the same in every language", () => {
    const addresses = new Set(locales.map((l) => copy[l].contact.email));
    expect(addresses.size).toBe(1);
  });
});
