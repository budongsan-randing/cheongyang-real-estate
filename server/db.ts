import { asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  inquiries,
  InsertUser,
  journalEntries,
  properties,
  siteSettings,
  users,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export type SiteContentInput = {
  officeName: string;
  phone: string;
  heroEyebrow: string;
  heroTitle: string;
  heroDescription: string;
  heroImageUrl?: string | null;
  properties: Array<{
    kind: "토지" | "전원주택" | "농지";
    title: string;
    location: string;
    detail: string;
    size: string;
    price: string;
    imageUrl?: string | null;
    tint: "clay" | "pine" | "cream";
  }>;
  journal: Array<{
    category: string;
    title: string;
    excerpt: string;
    dateLabel: string;
    readTime: string;
  }>;
};

const defaultContent: SiteContentInput = {
  officeName: "청양 부동산",
  phone: "041-000-0000",
  heroEyebrow: "CHEONGYANG · FIELD NOTE 01",
  heroTitle: "청양에서,\n오래 머물 땅을 찾습니다.",
  heroDescription: "토지부터 전원주택까지. 생활의 조건을 먼저 듣고, 현장에서 답을 확인합니다.",
  heroImageUrl: "/manus-storage/cheongyang-hero-ridge_a94ba82e.jpg",
  properties: [
    { kind: "토지", title: "칠갑산 자락의 완만한 남향 토지", location: "청양군 대치면", detail: "답사·건축 가능 여부를 함께 확인하는 필드 노트형 매물입니다.", size: "약 1,420㎡", price: "가격 상담", imageUrl: "/manus-storage/cheongyang-farmland_67451da2.jpg", tint: "cream" },
    { kind: "전원주택", title: "숲과 마을 사이, 작은 정원을 둔 집", location: "청양군 정산면", detail: "주말 체류와 귀촌 생활을 함께 검토할 수 있는 주거 제안입니다.", size: "대지 약 460㎡", price: "가격 상담", imageUrl: "/manus-storage/cheongyang-country-home_30661454.jpg", tint: "pine" },
    { kind: "농지", title: "생활권 가까이, 관리가 편한 농지", location: "청양군 운곡면", detail: "진입·경사·용도 등 현장 확인이 중요한 조건을 우선 살핍니다.", size: "약 2,060㎡", price: "가격 상담", imageUrl: null, tint: "clay" },
  ],
  journal: [
    { category: "답사 노트", title: "토지를 볼 때, 지목보다 먼저 확인할 세 가지", excerpt: "도로와 방향, 그리고 실제 생활권까지. 현장에서 질문해야 할 기준을 정리합니다.", dateLabel: "2026. 08. 12", readTime: "3분 읽기" },
    { category: "청양 생활", title: "정산면에서 시작하는 주말의 느린 동선", excerpt: "카페와 장보기, 산책을 한 번에 연결하는 청양의 생활 반경을 살펴봅니다.", dateLabel: "2026. 08. 05", readTime: "4분 읽기" },
    { category: "상담 가이드", title: "처음 문의할 때 남기면 좋은 조건들", excerpt: "예산, 방문 가능일, 원하는 생활의 모습만 알려 주셔도 상담이 훨씬 정확해집니다.", dateLabel: "2026. 07. 28", readTime: "2분 읽기" },
  ],
};

export async function getSiteContent(): Promise<SiteContentInput> {
  const db = await getDb();
  if (!db) return defaultContent;

  const [settings] = await db.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
  const savedProperties = await db.select().from(properties).orderBy(asc(properties.position));
  const savedJournal = await db.select().from(journalEntries).orderBy(asc(journalEntries.position));

  return {
    officeName: settings?.officeName ?? defaultContent.officeName,
    phone: settings?.phone ?? defaultContent.phone,
    heroEyebrow: settings?.heroEyebrow ?? defaultContent.heroEyebrow,
    heroTitle: settings?.heroTitle ?? defaultContent.heroTitle,
    heroDescription: settings?.heroDescription ?? defaultContent.heroDescription,
    heroImageUrl: settings?.heroImageUrl ?? defaultContent.heroImageUrl,
    properties: savedProperties.length > 0
      ? savedProperties.map(({ kind, title, location, detail, size, price, imageUrl, tint }) => ({ kind, title, location, detail, size, price, imageUrl, tint }))
      : defaultContent.properties,
    journal: savedJournal.length > 0
      ? savedJournal.map(({ category, title, excerpt, dateLabel, readTime }) => ({ category, title, excerpt, dateLabel, readTime }))
      : defaultContent.journal,
  };
}

export async function replaceSiteContent(input: SiteContentInput) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  await db.transaction(async (tx) => {
    const [settings] = await tx.select().from(siteSettings).where(eq(siteSettings.id, 1)).limit(1);
    const settingsValues = {
      officeName: input.officeName,
      phone: input.phone,
      heroEyebrow: input.heroEyebrow,
      heroTitle: input.heroTitle,
      heroDescription: input.heroDescription,
      heroImageUrl: input.heroImageUrl ?? null,
    };

    if (settings) {
      await tx.update(siteSettings).set(settingsValues).where(eq(siteSettings.id, 1));
    } else {
      await tx.insert(siteSettings).values({ id: 1, ...settingsValues });
    }

    await tx.delete(properties);
    if (input.properties.length) {
      await tx.insert(properties).values(input.properties.map((property, position) => ({ ...property, imageUrl: property.imageUrl ?? null, position })));
    }

    await tx.delete(journalEntries);
    if (input.journal.length) {
      await tx.insert(journalEntries).values(input.journal.map((entry, position) => ({ ...entry, position })));
    }
  });

  return getSiteContent();
}

export async function createInquiry(input: { name: string; contact: string; interest: string; message?: string | null }) {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");
  await db.insert(inquiries).values({ ...input, message: input.message ?? null });
  return { success: true } as const;
}

export async function listInquiries() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).orderBy(asc(inquiries.createdAt));
}
