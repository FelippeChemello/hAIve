/* eslint-disable @remotion/warn-native-media-tag */

import {useCallback, useEffect, useRef, useState} from 'react'
import {AbsoluteFill, useVideoConfig} from 'remotion'
import {z} from 'zod';
import * as tf from '@tensorflow/tfjs'; 
import * as facemesh from '@tensorflow-models/facemesh'; 

type Coordinates = {
  x: number;
  y: number;
}

const indicatorSize = 50;

const schema = z.object({
  videoURL: z.string().url(),
  videoWidth: z.number(),
  videoHeight: z.number(),
  onDone: z.function()
});

const getKey = (frame: number, src: string) =>
	['coordinates', frame, src].join('-');

const saveCalculatedFrame = (
	frame: number,
	src: string,
	coordinate: Coordinates | null
) => {
	const key = getKey(frame, src);
	localStorage.setItem(
		key,
		coordinate === null ? 'null' : JSON.stringify(coordinate)
	);
};

export const loadCalculateFrame = (frame: number, src: string): Coordinates | null | undefined => {
  const key = getKey(frame, src)
  const content = localStorage.getItem(key)
  if (!content) return undefined
  if (content === 'null') return null
  return JSON.parse(content)
}

export const FaceTracker: React.FC<z.infer<typeof schema>> = ({
  videoURL,
  videoHeight,
  videoWidth,
  onDone
}) => {
  const [framesAnalyzed, setFramesAnalyzed] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const net = useRef<facemesh.FaceMesh | null>(null);
  const {fps} = useVideoConfig();

  const loadFacemeshModel = useCallback(async () => {
    await tf.setBackend('webgl');
    const model = await facemesh.load();
    net.current = model;
  }, []);

  const callback = useCallback(async () => {
		if (!canvasRef.current || !videoRef.current) {
			throw new Error('should not happen');
		}
		const context = canvasRef.current.getContext('2d');
		if (!context) {
			throw new Error('should not happen');
		}
		context.drawImage(videoRef.current, 0, 0, videoWidth, videoHeight);
		
    const predictions = await net.current!.estimateFaces(canvasRef.current);
    if (!predictions.length) return null

    // @ts-expect-error - I don't know why this is happening
    const [x, y] = predictions[0].annotations.noseTip
    return { x, y };
	}, [videoRef, videoHeight, videoWidth]);

  const trackFrame = useCallback(async (video: HTMLVideoElement, frame: number): Promise<Coordinates | null> => {
    const loadedCalculateFrame = loadCalculateFrame(frame, videoURL)
    
    if (loadedCalculateFrame !== undefined) {
      return loadedCalculateFrame
    }

    return new Promise<Coordinates | null>((resolve) => {
				video.currentTime = frame / fps;
				video.requestVideoFrameCallback(async () => {
					const item = await callback();
					saveCalculatedFrame(frame, videoURL, item);
					if (!indicatorRef.current) {
						return;
					}
					if (item === null) {
						indicatorRef.current.style.left = '-999px';
						indicatorRef.current.style.top = '-999px';
					} else {
						indicatorRef.current.style.left = item.x - indicatorSize / 2 + 'px';
						indicatorRef.current.style.top = item.y - indicatorSize / 2 + 'px';
					}
					return resolve(item);
				});
			});
  }, [callback, fps, videoURL]);

  const startTracking = useCallback(async (video: HTMLVideoElement) => {
    const time = video.duration
    const frames = Math.floor(time * fps)

    for (let i = 0; i < frames; i++) {
      console.time(`Tracking frame ${i}`)
      await trackFrame(video, i)
      console.timeEnd(`Tracking frame ${i}`)
      setFramesAnalyzed(i)
    }

    onDone()
  }, [fps, onDone, trackFrame]);

  useEffect(() => {
    if (!videoRef.current) {
      return;
    }

    videoRef.current.addEventListener('loadedmetadata', () => {
      loadFacemeshModel().then(() => {
        startTracking(videoRef.current!)
      });
    });
  }, [startTracking, loadFacemeshModel]);

  return (
    <AbsoluteFill className="bg-gray-100 items-center justify-center">
      <AbsoluteFill>
        <video 
          ref={videoRef}
          src={videoURL}
        />
        </AbsoluteFill>

        <AbsoluteFill>
          <canvas ref={canvasRef} width={videoWidth} height={videoHeight} />
        </AbsoluteFill>

        			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					fontSize: 100,
					color: 'white',
					fontFamily: 'sans-serif',
					fontWeight: 'bold',
					textShadow: '0 0 5px black',
				}}
			>
				{framesAnalyzed} Frames analyzed
			</AbsoluteFill>

			<AbsoluteFill>
				<div
					ref={indicatorRef}
					style={{
						position: 'absolute',
						border: '5px solid blue',
						height: indicatorSize,
						width: indicatorSize,
					}}
				/>
			</AbsoluteFill>
    </AbsoluteFill>
  );
}