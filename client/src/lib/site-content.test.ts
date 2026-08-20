import { describe, expect, it } from "vitest";
import { defaultSiteContent } from "./site-content";

describe("defaultSiteContent image optimization", () => {
  it("uses a WebP hero asset", () => {
    expect(defaultSiteContent.heroImageUrl).toMatch(/\.webp$/);
  });

  it("uses WebP for every pre-registered listing image", () => {
    const imageUrls = defaultSiteContent.properties
      .map((property) => property.imageUrl)
      .filter((imageUrl): imageUrl is string => Boolean(imageUrl));

    expect(imageUrls).not.toHaveLength(0);
    expect(imageUrls.every((imageUrl) => imageUrl.endsWith(".webp"))).toBe(true);
  });
});
