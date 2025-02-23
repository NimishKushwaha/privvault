import { z } from 'zod'

export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  category: z.enum(['password', 'note', 'document']),
  fileName: z.string().optional().nullable()
})

export const updateItemSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  category: z.enum(['password', 'note', 'document']).optional(),
  fileName: z.string().optional().nullable()
})

export type CreateItemInput = z.infer<typeof createItemSchema>
export type UpdateItemInput = z.infer<typeof updateItemSchema> 