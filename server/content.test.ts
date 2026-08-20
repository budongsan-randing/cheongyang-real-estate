import { describe, expect, it } from "vitest";
import { adminPinSchema, siteContentInputSchema } from "./routers";

describe("siteContentInputSchema", () => {
  const validContent = {
    officeName: "청양 부동산",
    phone: "041-000-0000",
    heroEyebrow: "FIELD NOTE",
    heroTitle: "청양에서, 오래 머물 땅을 찾습니다.",
    heroDescription: "현장 확인을 중심으로 한 지역 부동산 안내입니다.",
    heroImageUrl: null,
    properties: [{ kind: "토지", title: "남향 토지", location: "청양군 대치면", detail: "진입로와 방향을 확인합니다.", size: "약 1,420㎡", price: "가격 상담", imageUrl: null, tint: "cream" }],
    journal: [{ category: "답사 노트", title: "토지 확인 기준", excerpt: "현장에서 확인할 요소를 기록합니다.", dateLabel: "2026. 08. 20", readTime: "3분 읽기" }],
  };

  it("accepts content suitable for immediate publishing", () => {
    expect(siteContentInputSchema.safeParse(validContent).success).toBe(true);
  });

  it("rejects a listing without a title", () => {
    expect(siteContentInputSchema.safeParse({ ...validContent, properties: [{ ...validContent.properties[0], title: "" }] }).success).toBe(false);
  });

  it("accepts only the configured simple administrator number", () => {
    expect(adminPinSchema.safeParse("1234").success).toBe(true);
    expect(adminPinSchema.safeParse("0000").success).toBe(false);
  });
});
