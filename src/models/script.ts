import {z} from 'zod'

export enum ScriptType {
  INTRO = 'INTRO',
  CONTENT = 'CONTENT',
  OUTRO = 'OUTRO',
}

export enum ScriptItemType {
  DESCRIPTION = 'DESCRIPTION',
  PATH = 'PATH',
  URL = 'URL',
}

export enum ImageAnimation {
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_OUT = 'ZOOM_OUT',
  LEFT_TO_RIGHT = 'LEFT_TO_RIGHT',
  RIGHT_TO_LEFT = 'RIGHT_TO_LEFT',
  TOP_TO_BOTTOM = 'TOP_TO_BOTTOM',
  BOTTOM_TO_TOP = 'BOTTOM_TO_TOP',
}

export const scriptItemDescriptionSchema = z.object({
  type: z.literal(ScriptItemType.DESCRIPTION),
  description: z.string(),
})

export const scriptItemPathSchema = z.object({
  type: z.literal(ScriptItemType.PATH),
  path: z.string(),
})

export const scriptItemUrlSchema = z.object({
  type: z.literal(ScriptItemType.URL),
  url: z.string(),
})

export const videoScriptBaseSchema = z.object({
  text: z.string(),
  type: z.nativeEnum(ScriptType),
  image: z.discriminatedUnion('type', [
    scriptItemDescriptionSchema,
    scriptItemPathSchema,
    scriptItemUrlSchema,
  ])
})

export type VideoScriptBase = z.infer<typeof videoScriptBaseSchema>

export const videoBaseSchema = z.object({
  videoTitle: z.string(),
  keywords: z.array(z.string()),
  script: z.array(videoScriptBaseSchema),
})

export type VideoBase = z.infer<typeof videoBaseSchema>

export const speechTimestampSchema = z.object({
  start: z.number(),
  end: z.number(),
  text: z.string(),
})

const videoScriptSchema = z.object({
  text: z.string(),
  type: z.nativeEnum(ScriptType),
  image: z.discriminatedUnion('type', [
    scriptItemPathSchema,
    scriptItemUrlSchema,
  ]),
  audio: z.discriminatedUnion('type', [
    scriptItemPathSchema,
    scriptItemUrlSchema,
  ]),
  speechTimestamp: z.array(speechTimestampSchema),
  animation: z.nativeEnum(ImageAnimation),
})

export type VideoScript = z.infer<typeof videoScriptSchema>

export const videoSchema = z.object({
  videoTitle: z.string(),
  keywords: z.array(z.string()),
  script: z.array(videoScriptSchema),
})

  