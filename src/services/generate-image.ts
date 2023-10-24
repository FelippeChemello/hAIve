import axios from 'axios'
import fs from 'node:fs'
import { PLAYGROUNAI_COOKIE } from '../config/env'

const api = axios.create({
    baseURL: 'https://playgroundai.com/'
})

export default async function generateImage(prompt: string, outputPath: string) {
    console.log(`[GENERATE_IMAGE] Generating image for prompt: ${prompt}`)

    const { data } = await api.post('/api/models', {
        width: 1024,
        height: 1024,
        seed: Math.round(Math.random() * 1000000000),
        num_images: 1,
        sampler: 1,
        cfg_scale: 7,
        guidance_scale: 7,
        strength: 1.3,
        steps: 30,
        negativePrompt: 'out of frame, lowres, text, error, cropped, worst quality, low quality, jpeg artifacts, ugly, duplicate, morbid, mutilated, out of frame, extra fingers, mutated hands, poorly drawn hands, poorly drawn face, mutation, deformed, blurry, dehydrated, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, username, watermark, signature,',
        prompt,
        hide: false, 
        isPrivate: false,
        modelType: 'stable-diffusion-xl',
        batchId: 'Jt9pHfw6BL',
        generateVariants: false,
        initImageFromPlayground:false
    }, {
        headers: {
            'Cookie': PLAYGROUNAI_COOKIE
        }
    })

    const image = data.images[0].url
    const base64Data = image.replace(/^data:image\/jpg;base64,/, "");
    fs.writeFileSync(outputPath, base64Data, 'base64');
}