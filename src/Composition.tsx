import {useCallback, useState} from 'react'
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {z} from 'zod';
import { FaceTracker } from './FaceTracker';
import { VideoReframer } from './VideoReframer';

export const schema = z.object({
	video: z.object({
		url: z.string().url(),
		width: z.number(),
		height: z.number(),
	}),
});

export const Main: React.FC<z.infer<typeof schema>> = ({
	video: {
		url: videoURL,
		height: videoHeight,
		width: videoWidth,
	}
}) => {
	const [waitForFaceTracking] = useState(() => delayRender());
	const [faceTracked, setFaceTracked] = useState(false);

	const onFaceTracked = useCallback(() => {
		setFaceTracked(true);
		continueRender(waitForFaceTracking);
	}, [waitForFaceTracking]);

	return (
		<AbsoluteFill className="bg-gray-100 items-center justify-center">
			{faceTracked 
				? <VideoReframer videoHeight={videoHeight} videoWidth={videoWidth} videoURL={videoURL} />
				: <FaceTracker videoURL={videoURL} videoHeight={videoHeight} videoWidth={videoWidth} onDone={onFaceTracked} />
			}
		</AbsoluteFill>
	);
};
