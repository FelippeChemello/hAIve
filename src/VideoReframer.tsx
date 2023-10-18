import { useCallback, useEffect, useMemo, useRef } from 'react';
import { AbsoluteFill, Video, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { loadCalculateFrame, trackEachFrames } from './FaceTracker';

const schema = z.object({
  videoURL: z.string().url(),
  videoWidth: z.number(),
  videoHeight: z.number(),
});

export const VideoReframer: React.FC<z.infer<typeof schema>> = ({
  videoURL,
  videoHeight,
  videoWidth,
}) => {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height, fps, durationInFrames } = useVideoConfig();
  const currentFrame = useCurrentFrame();
  
  const targetX = useMemo(() => {
    const frames = [];

    for (let i = 0; i < durationInFrames; i++) {
      if (i % trackEachFrames !== 0) continue
      
      const framePosition = loadCalculateFrame(i, videoURL)
      if (framePosition && framePosition.x) {        
        frames.push(framePosition.x)
      }
    }

    return frames;
  }, []);

  const onVideoFrame = useCallback(async () => {
    if (!canvas.current || !video.current) {
      return;
    }
    const context = canvas.current.getContext('2d');
    if (!context) {
      return;
    }

    
    const frames = Array.from(Array(targetX.length).keys()).map((_, i) => i * trackEachFrames)
    console.log(frames, targetX)

    const x = interpolate(currentFrame, frames, targetX) 
    const zoom = 3.5

    context.clearRect(0, 0, width, height);
    context.drawImage(
      video.current,
      x - videoWidth / (zoom * 2),
      0,
      videoWidth / 3,
      videoHeight,
      0,
      0,
      width,
      height
    );
  }, [videoWidth, videoHeight, videoURL, currentFrame, targetX, width, height, fps]);

  useEffect(() => {
    const { current } = video;
    if (!current?.requestVideoFrameCallback) {
      return;
    }

    let handle = 0;
    const callback = () => {
      onVideoFrame();
      handle = current.requestVideoFrameCallback(callback);
    };

    callback();

    return () => {
      current.cancelVideoFrameCallback(handle);
    };
  }, [onVideoFrame]);

  return (
    <>
      <AbsoluteFill>
        <Video ref={video} style={{ opacity: 0 }} src={videoURL} />
      </AbsoluteFill>
      <canvas ref={canvas} height={height} width={width} style={{ width: '100%', height: '100%' }} />
    </>
  );
};
