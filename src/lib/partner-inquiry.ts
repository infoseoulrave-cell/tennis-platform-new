import { z } from "zod";

export const INQUIRY_TYPES = ["shop", "coach", "brand", "other"] as const;

export const INQUIRY_TYPE_LABELS: Record<(typeof INQUIRY_TYPES)[number], string> = {
  shop: "테니스 샵 / 오프라인 매장",
  coach: "코치 / 레슨",
  brand: "브랜드 / 유통사",
  other: "기타",
};

export const partnerInquirySchema = z.object({
  inquiryType: z.enum(INQUIRY_TYPES),
  name: z.string().trim().min(1, "이름/상호를 입력해 주세요").max(255),
  contact: z.string().trim().min(1, "연락처를 입력해 주세요").max(255),
  message: z.string().trim().max(2000).optional(),
  website: z.string().max(255).optional().refine((value) => !value?.trim(), {
    message: "Invalid submission",
  }),
});
