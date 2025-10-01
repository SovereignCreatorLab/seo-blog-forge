import { z } from 'zod';

export const ArticleSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(3),
  title: z.string().min(3),
  content: z.string().min(20),
  summary: z.string().min(10).optional(),
  keywords: z.array(z.string()).default([]),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
export type Article = z.infer<typeof ArticleSchema>;

export const KeywordEntrySchema = z.object({
  id: z.string().uuid().optional(),
  topic: z.string().min(2),
  keywords: z.array(z.string()),
  createdAt: z.string().optional(),
});
export type KeywordEntry = z.infer<typeof KeywordEntrySchema>;
