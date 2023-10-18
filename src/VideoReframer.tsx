import { useCallback, useEffect, useRef } from 'react';
import { AbsoluteFill, Video, interpolate, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';

export const centerSchema = z.record(z.string(), z.array(z.number()).length(2));

const schema = z.object({
  videoURL: z.string().url(),
  videoWidth: z.number(),
  videoHeight: z.number(),
  center: centerSchema,
});

export const VideoReframer: React.FC<z.infer<typeof schema>> = ({
  videoURL,
  videoHeight,
  videoWidth,
  center
}) => {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const { width, height } = useVideoConfig();
  const currentFrame = useCurrentFrame();

  const onVideoFrame = useCallback(async () => {
    if (!canvas.current || !video.current) {
      return;
    }
    const context = canvas.current.getContext('2d');
    if (!context) {
      return;
    }
    
    const {frames, targetX}: {frames: Array<number>, targetX: Array<number>} = Object.entries(center)
      .reduce((acc, [frame, [x]]) => {
        acc.frames.push(Number(frame))
        acc.targetX.push(x)
        return acc
      }, {frames: [] as Array<number>, targetX: [] as Array<number>})

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
  }, [videoWidth, videoHeight, currentFrame, center, width, height]);

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
        <Video ref={video} src={videoURL} className='opacity-0'/>
      </AbsoluteFill>
      <canvas ref={canvas} height={height} width={width} className='w-full h-full' />
    </>
  );
};
