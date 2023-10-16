import axios from 'axios'
import fs from 'node:fs'

import { ELEVEN_LABS_API_KEYS } from "../config/env";

type SynthesizeElevenLabsOptions = {
    text: string, 
    outputPath: string,  
    apiKey?: string, 
    voice?: string
}

const api = axios.create({
    baseURL: 'https://api.elevenlabs.io',
})

async function getElevenLabsUsage() {
    const usage: Array<{usage: number, limit: number, apiKey: string}> = []

    let index = 0
    for (const key of ELEVEN_LABS_API_KEYS) {
        const response = await api.get('/v1/user', {
            headers: {
                'Xi-Api-Key': key
            },
        })

        console.log(`[TEXT_TO_SPEECH] Account ${index++} usage: ${response.data.subscription.character_count}/${response.data.subscription.character_limit}`)

        usage.push({
            usage: response.data.subscription.character_count,
            limit: response.data.subscription.character_limit,
            apiKey: key,
        })
    }

    return usage
}

async function syntesizeElevenLabs({ text, outputPath, apiKey, voice }: SynthesizeElevenLabsOptions) {
    const response = await api.post(`/v1/text-to-speech/${voice || 'pNInz6obpgDQGcFmaJgB'}`, {
        text,
        model_id: "eleven_multilingual_v2"
    }, {
        responseType: 'arraybuffer',
        headers: {
            'Xi-Api-Key': apiKey || null
        },
    })

    fs.writeFileSync(outputPath, response.data)
}

export default async function textToSpeech(text: string, outputPath: string) {
    const usage = await getElevenLabsUsage()
    
    const available = usage.filter(u => u.usage + text.length < u.limit)
    const account = available.sort((a, b) => a.usage - b.usage)[0]

    try {
        console.log(`[TEXT_TO_SPEECH] Synthesizing: ${text}`)
        await syntesizeElevenLabs({
            text,
            outputPath,
        })
    } catch (error) {
        console.log(`[TEXT_TO_SPEECH] Synthesizing with apiKey`)
        await syntesizeElevenLabs({
            text,
            outputPath,
            apiKey: account?.apiKey
        })
    }
}