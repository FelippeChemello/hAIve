import fs from 'node:fs'

import { Transcript } from "../models/transcript";
import transcribe from "./transcribe";

function normalize(word: string){
    return word.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase().trim();
}

export default async function AlignTextWithAudio(audioPath: string, text: string): Promise<Transcript> {
    const words = text.split(' ');
    const transcription = await transcribe(audioPath);
    const transcriptionWithExtraInfo = transcription.map((transcript, index) => ({
        ...transcript,
        match: false,
        index
    }));

    fs.writeFileSync('transcription.json', JSON.stringify(transcriptionWithExtraInfo, null, 2));    

    console.log('[ALIGN] Aligning text with audio');

    const aligned: Transcript = []
    for (const wIndex in words) {
        const wordIndex = parseInt(wIndex);
        const word = words[wordIndex];
        const normalizedWord = normalize(word);
        
        const transcriptionSlidingWindow = transcriptionWithExtraInfo.slice(wordIndex - 5, wordIndex + 5);
        const bestMatch = transcriptionSlidingWindow.find(({text}) => normalize(text) === normalizedWord);
        if (bestMatch) {
            console.log(`[ALIGN] Found match for ${word}`)
            bestMatch.match = true;
            aligned.push({
                text: word,
                start: bestMatch.start,
                end: bestMatch.end,
            });
        } else {
            console.warn(`[ALIGN] Could not find match for ${word}`);
            aligned.push({
                text: word,
                start: -1,
                end: -1
            });
        }
    }

    const groupedByUnaligned = aligned.reduce((acc, word) => {
        const lastGroup = acc[acc.length - 1];

        if (word.start < 0 || word.end < 0) {
            if (lastGroup && lastGroup.every((w) => w.start < 0 && w.end < 0)) {
                lastGroup.push(word);
            } else {
                acc.push([word]);
            }
        } else {
            acc.push([word]);
        }

        return acc;
    }, [] as Array<Transcript>)


    const alignedWithEstimatedTimes: Transcript = []
    let previousAlignedWord: { text: string, start: number, end: number } | undefined;
    for (const gIndex in groupedByUnaligned) {
        const groupIndex = parseInt(gIndex);
        const group = groupedByUnaligned[groupIndex];

        const isAligned = group.every((w) => w.start >= 0 && w.end >= 0);
        if (isAligned) {
            alignedWithEstimatedTimes.push(...group);
            previousAlignedWord = group.at(-1)
            continue;
        }

        const nextAlignedWord = groupedByUnaligned[groupIndex + 1]?.at(0);

        const estimatedStart = previousAlignedWord ? previousAlignedWord.end : 0;
        const estimatedEnd = nextAlignedWord ? nextAlignedWord.start : transcriptionWithExtraInfo.at(-1)?.end || 0;

        const estimatedDuration = estimatedEnd - estimatedStart;
        const estimatedCharDuration = estimatedDuration / group.map(({text}) => text).join('').length;

        const groupWithEstimatedTimes = group.map((word, index, array) => {
            const start = estimatedStart + array.slice(0, index).map(({text}) => text).join('').length * estimatedCharDuration
            const end = start + word.text.length * estimatedCharDuration;
            
            return { ...word, start: Math.ceil(start * 100) / 100, end: Math.floor(end * 100) / 100 }
        });

        alignedWithEstimatedTimes.push(...groupWithEstimatedTimes);
    }

    return alignedWithEstimatedTimes;
}