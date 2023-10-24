import { getAudioDurationInSeconds } from 'get-audio-duration';
import ffprobe from '@ffprobe-installer/ffprobe'

export default function getAudioDuration(path: string) {
    return getAudioDurationInSeconds(path, ffprobe.path)
}