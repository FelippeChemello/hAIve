import env from 'env-var'

export const ELEVEN_LABS_API_KEYS = env.get('ELEVEN_LABS_API_KEYS').required().asArray()
export const PLAYGROUNAI_COOKIE = env.get('PLAYGROUNAI_COOKIE').required().asString()