import {useMemo} from 'react'
import {AbsoluteFill} from 'remotion';
import {z} from 'zod';
import { VideoReframer, centerSchema } from './VideoReframer';
import {Subtitles, schema as wordSubtitleSchema} from './Subtitles'

export const subtitleSchema = z.array(z.object({
	speaker: z.number(),
	sentence: z.string(),
	words_with_timestamp: z.array(wordSubtitleSchema)
})).optional()

export const schema = z.object({
	video: z.object({
		url: z.string().url(),
		width: z.number(),
		height: z.number(),
	}),
	subtitles: subtitleSchema,
	center: centerSchema
});

export const Main: React.FC<z.infer<typeof schema>> = ({
	video: {
		url: videoURL,
		height: videoHeight,
		width: videoWidth,
	},
	subtitles,
	center
}) => {
	const words = useMemo(() => {
		if (!subtitles) {
			return [];
		}

		return subtitles?.map(({words_with_timestamp}) => words_with_timestamp).flat()
	}, [subtitles]);

	return (
		<AbsoluteFill className="bg-gray-100 items-center justify-center">
			<VideoReframer videoHeight={videoHeight} videoWidth={videoWidth} videoURL={videoURL} center={center} />
			{Boolean(words.length) && words.map((word, index) => <Subtitles key={index} {...word} />)}
		</AbsoluteFill>
	);
};
