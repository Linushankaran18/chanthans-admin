import { z } from 'zod'

export const heroSchema = z.object({
  title: z.string().max(200, 'Title is too long.'),
  subtitle: z.string().max(300, 'Subtitle is too long.'),
  alt_text: z.string().max(300, 'Alt text is too long.'),
  display_order: z
    .number({ error: 'Enter a number, like 1.' })
    .int('Use a whole number.')
    .min(1, 'Order starts at 1.'),
  is_active: z.boolean(),
})

export type HeroFormValues = z.infer<typeof heroSchema>
