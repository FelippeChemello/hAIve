import { AbsoluteFill, interpolate, useCurrentFrame, OffthreadVideo } from 'remotion';
import { z } from 'zod';

export const centerSchema = z.record(z.number(), z.object({
  x: z.number(),
  y: z.number(),
}));

const schema = z.object({
  videoURL: z.string().url(),
  center: centerSchema,
});

export const VideoReframer: React.FC<z.infer<typeof schema>> = ({
  videoURL,
  center
}) => {
  const currentFrame = useCurrentFrame();

  const frames = [];
  const targetX = [];

  for (const frame in center) {
    frames.push(Number(frame));
    targetX.push(center[frame].x);
  }

  const x = interpolate(currentFrame, frames, targetX) 

  return (
    <AbsoluteFill className='flex justify-center'>
      <OffthreadVideo src={videoURL} className='absolute h-[100%] max-w-none' style={{
        transform: `translateX(calc(-${x}px - 128px))`
      }}/>
    </AbsoluteFill>
  );
};
