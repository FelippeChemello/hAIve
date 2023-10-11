import { z } from "zod";

export const transcriptSchema = z.array(z.object({
  text: z.string(),
  start: z.number(),
  end: z.number(),
}))

export type Transcript = z.infer<typeof transcriptSchema>