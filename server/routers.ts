import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { createInquiry, getSiteContent, listInquiries, replaceSiteContent } from "./db";
import { storagePut } from "./storage";

export const adminPinSchema = z.string().refine((value) => value === "1234", { message: "관리자번호가 올바르지 않습니다." });

const propertySchema = z.object({
  kind: z.enum(["토지", "전원주택", "농지"]),
  title: z.string().trim().min(1).max(240),
  location: z.string().trim().min(1).max(240),
  detail: z.string().trim().min(1).max(5000),
  size: z.string().trim().min(1).max(100),
  price: z.string().trim().min(1).max(100),
  imageUrl: z.string().trim().min(1).nullable().optional(),
  tint: z.enum(["clay", "pine", "cream"]),
});

const journalSchema = z.object({
  category: z.string().trim().min(1).max(80),
  title: z.string().trim().min(1).max(240),
  excerpt: z.string().trim().min(1).max(5000),
  dateLabel: z.string().trim().min(1).max(40),
  readTime: z.string().trim().min(1).max(40),
});

export const siteContentInputSchema = z.object({
  officeName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  heroEyebrow: z.string().trim().min(1).max(160),
  heroTitle: z.string().trim().min(1).max(500),
  heroDescription: z.string().trim().min(1).max(5000),
  heroImageUrl: z.string().trim().min(1).nullable().optional(),
  properties: z.array(propertySchema).min(1).max(30),
  journal: z.array(journalSchema).min(1).max(30),
});

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  content: router({
    get: publicProcedure.query(() => getSiteContent()),
    verifyPin: publicProcedure.input(z.object({ adminPin: adminPinSchema })).mutation(() => ({ success: true } as const)),
    save: publicProcedure.input(z.object({ adminPin: adminPinSchema, content: siteContentInputSchema })).mutation(({ input }) => replaceSiteContent(input.content)),
    uploadImage: publicProcedure.input(z.object({
      adminPin: adminPinSchema,
      fileName: z.string().trim().min(1).max(120),
      dataUrl: z.string().min(30).max(8_000_000),
    })).mutation(async ({ input }) => {
      const match = input.dataUrl.match(/^data:(image\/(?:png|jpeg|webp));base64,(.+)$/);
      if (!match) {
        throw new Error("PNG, JPG, WEBP 이미지만 업로드할 수 있습니다.");
      }
      const rawBytes = Buffer.from(match[2], "base64");
      if (rawBytes.byteLength > 5 * 1024 * 1024) {
        throw new Error("이미지는 5MB 이하로 업로드해 주세요.");
      }
      const extension = match[1] === "image/jpeg" ? "jpg" : match[1].split("/")[1];
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 60);
      const result = await storagePut(`real-estate/managed/${Date.now()}-${safeName || "property"}.${extension}`, rawBytes, match[1]);
      return { url: result.url };
    }),
  }),
  inquiry: router({
    submit: publicProcedure.input(z.object({
      name: z.string().trim().min(1).max(100),
      contact: z.string().trim().min(1).max(80),
      interest: z.string().trim().min(1).max(80),
      message: z.string().trim().max(3000).optional(),
    })).mutation(({ input }) => createInquiry(input)),
    list: publicProcedure.input(z.object({ adminPin: adminPinSchema })).query(() => listInquiries()),
  }),
});

export type AppRouter = typeof appRouter;
