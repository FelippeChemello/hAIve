import {useCallback, useMemo, useState} from 'react'
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {z} from 'zod';
import { FaceTracker } from './FaceTracker';
import { VideoReframer } from './VideoReframer';
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
	subtitles: subtitleSchema
});

export const Main: React.FC<z.infer<typeof schema>> = ({
	video: {
		url: videoURL,
		height: videoHeight,
		width: videoWidth,
	},
	subtitles
}) => {
	const [waitForFaceTracking] = useState(() => delayRender('Face tracking'));
	const [faceTracked, setFaceTracked] = useState(false);

	const onFaceTracked = useCallback(() => {
		continueRender(waitForFaceTracking);
		setFaceTracked(true);
	}, [waitForFaceTracking]);

	const words = useMemo(() => {
		if (!subtitles) {
			return [];
		}

		return subtitles?.map(({words_with_timestamp}) => words_with_timestamp).flat()
	}, [subtitles]);

	return (
		<AbsoluteFill className="bg-gray-100 items-center justify-center">
			{faceTracked 
				? <VideoReframer videoHeight={videoHeight} videoWidth={videoWidth} videoURL={videoURL} />
				: <FaceTracker videoURL={videoURL} videoHeight={videoHeight} videoWidth={videoWidth} onDone={onFaceTracked} />
			}
			{Boolean(words.length) && words.map((word, index) => <Subtitles key={index} {...word} />)}
		</AbsoluteFill>
	);
};
