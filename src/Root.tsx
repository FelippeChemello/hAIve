import {Composition, continueRender, delayRender, cancelRender, staticFile, CalculateMetadataFunction} from 'remotion';
import {Main, schema, subtitleSchema} from './Composition';
import './style.css';
import { useEffect, useState } from 'react';
import { VideoMetadata, getVideoMetadata } from '@remotion/media-utils';
import { z } from 'zod';
import { faceTracker } from './face-tracker';

const calculateMetadata: CalculateMetadataFunction<z.infer<typeof schema>> = async ({
	props,
}) => {
	const center = await faceTracker(props.video.url, 15, 30)

	return {
		props: {
			...props,
			center
		}
	}
}

export const RemotionRoot: React.FC = () => {
	const videoURL = staticFile('video.mp4');
	const subtitlesURL = staticFile('subtitles.json');

	const [waitForVideoMetadata] = useState(() => delayRender('Video metadata'));
	const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
	
	const [waitForSubtitles] = useState(() => delayRender('Subtitles'));
	const [subtitles, setSubtitles] = useState<z.infer<typeof subtitleSchema> | null>(null);

	useEffect(() => {
		getVideoMetadata(videoURL)
			.then((data) => {
				setVideoData(data);
				continueRender(waitForVideoMetadata);
			})
			.catch((err) => {
				console.error(err);
				cancelRender('Video metadata');
			});

		fetch(subtitlesURL)
			.then((response) => response.json())
			.then((data) => {
				setSubtitles(data);
				continueRender(waitForSubtitles);
			})
			.catch((err) => {
				console.error(err);
				cancelRender('Subtitles');
			});
	}, [waitForVideoMetadata, videoURL, subtitlesURL, waitForSubtitles]);



	if (!videoData || !subtitles) {
		return null;
	}

	const {durationInSeconds, height, width} = videoData

	return (
		<>
			<Composition
				id="Main"
				component={Main}
				durationInFrames={Math.floor(durationInSeconds * 30)}
				fps={30}
				width={height}
				height={width}
				schema={schema}
				calculateMetadata={calculateMetadata}
				defaultProps={{
					video: {
						url: videoURL,
					},
					subtitles,
					groupWords: 1,
				}}
			/>
		</>
	);
};
