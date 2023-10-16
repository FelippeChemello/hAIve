import {Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion'
import {useEffect, useState} from 'react'
import {AbsoluteFill, continueRender, delayRender, Sequence, Audio, staticFile} from 'remotion';
import {z} from 'zod';
import { ImageAnimation, ScriptItemType, Video } from '../src/models/script';
import { AudioViz } from './AudioViz';
import { PaginatedSubtitles } from './Subtitle';

export const schema = z.object({
	scriptPath: z.string(),
});

export const Landscape: React.FC<z.infer<typeof schema>> = ({
	scriptPath
}) => {
    const [script, setScript] = useState<Video | undefined>();
    const [handle] = useState(() => delayRender())
    const { fps } = useVideoConfig()
    const frame = useCurrentFrame()

    useEffect(() => {
        fetch(staticFile(scriptPath))
            .then((res) => res.json())
            .then((data) => setScript(data))

        continueRender(handle)
    }, [scriptPath, handle]);

    if (!script) return null

	return (
        <AbsoluteFill style={{ backgroundColor: '#cbd5e1' }}>
            {script.script.map((scene, index, array) => {
                const from = array.slice(0, index).reduce((acc, curr) => acc + curr.audioDuration, 0) * fps
                const duration = scene.audioDuration * fps
                const to = from + duration
                
                const scale = interpolate(frame, [from, to], scene.animation === ImageAnimation.ZOOM_OUT ? [1.2, 1] : [1, 1.2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})


                return (
                    <Sequence key={index} from={from} durationInFrames={duration}>
                        <Audio src={scene.audio.type === ScriptItemType.PATH ? staticFile(scene.audio.path) : scene.audio.url} />

                        <main style={{ display: 'flex', width: '100%' }}>
                            <div
                                style={{
                                    width: '60%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden'
                                }}
                            >
                                <Img 
                                    src={scene.image.type === ScriptItemType.PATH ? staticFile(scene.image.path) : scene.image.url} 
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                        transform: `scale(${scale})`
                                    }}
                                />
                            </div>

                            <div style={{ padding: 16, flex: 1, display: 'flex', flexDirection: 'column', justifyItems: 'start', gap: 32 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold' }}>
                                    {script.videoTitle}
                                </div>

                                <AudioViz
                                    mirrorWave
                                    audioSrc={scene.audio.type === ScriptItemType.PATH ? staticFile(scene.audio.path) : scene.audio.url}
                                    numberOfSamples={256}
                                    waveLinesToDisplay={128}
                                />

                                <div style={{ flex: 1 }}>
                                    <PaginatedSubtitles
                                        onlyDisplayCurrentSentence
                                        subtitles={scene.speechTimestamp}
                                        startFrame={0}
                                        endFrame={Math.floor(scene.audioDuration * fps)}
                                        linesPerPage={80}
                                        subtitlesZoomMeasurerSize={64}
                                        subtitlesLineHeight={0}
                                    />
                                </div>
                            </div>
                        </main>
                    </Sequence>
                )
            })}
        </AbsoluteFill>
    );
};
