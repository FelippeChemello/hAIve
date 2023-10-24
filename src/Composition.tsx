import {useMemo} from 'react'
import {AbsoluteFill, Video} from 'remotion';
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
	}),
	subtitles: subtitleSchema,
	center: centerSchema.optional(),
	groupWords: z.number().min(1).optional().default(1)
});

export const Main: React.FC<z.infer<typeof schema>> = ({
	video: {
		url: videoURL,
	},
	subtitles,
	center,
	groupWords
}) => {
	const words = useMemo(() => {
		if (!subtitles) {
			return [];
		}

		return subtitles
			.map(({words_with_timestamp}) => words_with_timestamp)
			.flat()
			.reduce((acc, words_with_timestamp, index) => {
				if (index % groupWords === 0 || index === 0) {
					acc.push([])
				}

				acc.at(-1)!.push(words_with_timestamp)

				return acc
			}, [] as Array<Array<z.infer<typeof wordSubtitleSchema>>>)
			.map((words_with_timestamp_group) => {
				const text = words_with_timestamp_group.map(({word}) => word).join(' ')
				const startTime = words_with_timestamp_group[0].start_time
				const endTime = words_with_timestamp_group.at(-1)!.end_time

				return {word: text, start_time: startTime, end_time: endTime}
			})

	}, [subtitles, groupWords]);

	return (
		<AbsoluteFill className="bg-gray-100 items-center justify-center">
			{center ? <VideoReframer videoURL={videoURL} center={center} /> : <Video src={videoURL} />}
			{Boolean(words.length) && words.map((word, index) => <Subtitles key={index} {...word} />)}
		</AbsoluteFill>
	);
};
