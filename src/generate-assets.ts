import path from 'node:path'
import fs from 'node:fs'

import { ImageAnimation, ScriptItemType, Video, videoBaseSchema } from './models/script'
import textToSpeech from './services/text-to-speech'
import getAudioDuration from './services/get-audio-duration'
import generateImage from './services/generate-image'
import alignTextWithAudio from './services/align-text-with-audio'

async function main() {
    const dirname = '2023_10_11-00_39_38'
    const dir = path.resolve(__dirname, '..', 'public', dirname)

    const content = videoBaseSchema.parse(JSON.parse(fs.readFileSync(path.resolve(dir, 'script.json'), 'utf-8')))
    
    const audioDir = path.join(dir, 'audio')
    fs.mkdirSync(audioDir, { recursive: true })
    const imagesDir = path.join(dir, 'images')
    fs.mkdirSync(path.join(dir, 'images'), { recursive: true })

    const contentWithMetadata: Partial<Video> = content
    let itemIndex = 0
    for (const item of content.script) {
        itemIndex++
        console.log(`[MAIN] Processing item ${itemIndex}: ${item.type}`)

        // const audioPath = path.join(audioDir, `${itemIndex}.mp3`)
        // await textToSpeech(item.text, audioPath)
        const audioDuration = await getAudioDuration(path.join(audioDir, `${itemIndex}.mp3`))
        console.log(`[MAIN] Audio duration: ${audioDuration}`)

        const speechTimestamp = await alignTextWithAudio(path.join(audioDir, `${itemIndex}.mp3`), item.text)

        // const imagePath = path.join(imagesDir, `${itemIndex}.jpg`)
        // await generateImage(item.image.type === ScriptItemType.DESCRIPTION ? item.image.description : item.text, imagePath)

        contentWithMetadata.script![itemIndex - 1] = {
            ...item,
            audioDuration,
            image: {
                type: ScriptItemType.PATH,
                path: `${dirname}/images/${itemIndex}.jpg`
            },
            audio: {
                type: ScriptItemType.PATH,
                path: `${dirname}/audio/${itemIndex}.mp3`
            },
            speechTimestamp,
            animation: itemIndex % 2 === 0 ? ImageAnimation.ZOOM_IN : ImageAnimation.ZOOM_OUT
        }   
    }

    fs.writeFileSync(path.join(dir, 'script-with-metadata.json'), JSON.stringify(contentWithMetadata, null, 2))
}

main().catch(error => {
    console.error(JSON.stringify(error, null, 2))
    process.exit(1)
})