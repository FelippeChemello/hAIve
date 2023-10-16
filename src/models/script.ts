import {z} from 'zod'

export enum ScriptType {
  INTRO = 'INTRO',
  CONTENT = 'CONTENT',
  OUTRO = 'OUTRO',
  END = 'END',
}

export enum ScriptItemType {
  DESCRIPTION = 'DESCRIPTION',
  PATH = 'PATH',
  URL = 'URL',
  VOID = 'VOID',
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

export const scriptItemVoidSchema = z.object({
    type: z.literal(ScriptItemType.VOID),
})

export const videoScriptBaseSchema = z.object({
    text: z.string(),
    type: z.nativeEnum(ScriptType).default(ScriptType.CONTENT),
    image: z.discriminatedUnion('type', [
        scriptItemDescriptionSchema,
        scriptItemPathSchema,
        scriptItemUrlSchema,
        scriptItemVoidSchema
    ]).default({type: ScriptItemType.VOID})
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
  audioDuration: z.number(),
  speechTimestamp: z.array(speechTimestampSchema),
  animation: z.nativeEnum(ImageAnimation),
})

export type VideoScript = z.infer<typeof videoScriptSchema>

export const videoSchema = z.object({
  videoTitle: z.string(),
  keywords: z.array(z.string()),
  script: z.array(videoScriptSchema),
})

export type Video = z.infer<typeof videoSchema>
  