import fs from 'node:fs'
import { WaveFile } from 'wavefile'
import { pipeline } from '@xenova/transformers';
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'

import { Transcript } from "../models/transcript";

function convertMP3ToWAV(mp3_path: string, wav_path: string) {
    return new Promise((resolve, reject) => {
        ffmpeg(mp3_path)
            .setFfmpegPath(ffmpegPath.path)
            .toFormat('wav')
            .output(wav_path)
            .on('end', resolve)
            .on('error', reject)
            .run()
    })
}


async function readAudioData(audio_path: string) {
    const wav_path = audio_path.replace('.mp3', '.wav');
    await convertMP3ToWAV(audio_path, wav_path);

    const audio = fs.readFileSync(wav_path);
    const wav = new WaveFile(audio);
    wav.toBitDepth("32f");
    wav.toSampleRate(16000);
    return wav.getSamples();
};

export default async function transcribe(audioPath: string): Promise<Transcript> {
    console.log(`[TRANSCRIBE] Transcribing ${audioPath}`)
    const audio = readAudioData(audioPath);

    const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny', {
        progress_callback: (progress: any) => console.log(`[TRANSCRIBE] ${progress.status}: ${progress.file ?? progress.model} ${Math.round(progress.progress || 100)}%`),
    })

    console.log(`[TRANSCRIBE] Transcribing audio`)
    const { chunks } = await transcriber(audio, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: 'word',
        callback_function(beams: any) {
            const decodedText = transcriber.tokenizer.decode(beams[0].output_token_ids, {
                skip_special_tokens: true,
            })

            console.log(`[TRANSCRIBE] Decoded text: ${decodedText.split(' ').slice(-5).join(' ')}`)
        },
    }) as {text: string, chunks: Array<{text: string, timestamp: Array<number>}>}

    console.log(chunks)

    return chunks.map(({text, timestamp}) => ({
        text,
        start: timestamp[0],
        end: timestamp[1],
    }))
}