import { useCallback, useEffect, useRef } from 'react';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig } from 'remotion';
import { z } from 'zod';
import { loadCalculateFrame } from './FaceTracker';

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

    const framePosition = await loadCalculateFrame(currentFrame, videoURL);
    if (!framePosition || !framePosition.x) {
      return;
    }

    const [ x, y ] = framePosition.x;

    const zoomFactor = 3; // Adjust as needed
    const targetWidth = videoWidth / zoomFactor;

    const targetX = x - targetWidth / 2;

    context.clearRect(0, 0, width, height);
    context.drawImage(
      video.current,
      targetX,
      0,
      targetWidth,
      videoHeight,
      0,
      0,
      width,
      height
    );
  }, [videoWidth, videoHeight, videoURL, currentFrame, width, height]);

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
