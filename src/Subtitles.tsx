import {AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import {z} from 'zod'

export const schema = z.object({
	word: z.string(),
	start_time: z.number(),
	end_time: z.number(),
})

export const Subtitles: React.FC<z.infer<typeof schema>> = ({
	word,
	start_time,
	end_time,
}) => {
	const {fps} = useVideoConfig();

	return (
		<Sequence from={Math.floor(start_time / 1000 * fps)} durationInFrames={Math.max(1, Math.floor(((end_time / 1000) - (start_time / 1000)) * fps))}>
			<AbsoluteFill className='z-50 relative'>
				<div className="absolute text-6xl font-bold text-center top-[70%] translate-y-[50%] translate-x-[50%] right-[50%] w-fit text-slate-700 bg-slate-50 p-4 rounded-3xl">{word}</div>
			</AbsoluteFill>
		</Sequence>
	);
}