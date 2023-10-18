import {Composition, continueRender, delayRender, cancelRender, staticFile} from 'remotion';
import {Main, schema, subtitleSchema} from './Composition';
import './style.css';
import { useEffect, useState } from 'react';
import { VideoMetadata, getVideoMetadata } from '@remotion/media-utils';
import { z } from 'zod';
import { centerSchema } from './VideoReframer';

export const RemotionRoot: React.FC = () => {
	const videoURL = staticFile('video.mp4');
	const subtitlesURL = staticFile('subtitles.json');
	const centerURL = staticFile('center.json');

	const [waitForVideoMetadata] = useState(() => delayRender('Video metadata'));
	const [videoData, setVideoData] = useState<VideoMetadata | null>(null);
	
	const [waitForSubtitles] = useState(() => delayRender('Subtitles'));
	const [subtitles, setSubtitles] = useState<z.infer<typeof subtitleSchema> | null>(null);

	const [waitForCenter] = useState(() => delayRender('Center'));
	const [center, setCenter] = useState<z.infer<typeof centerSchema> | null>(null);

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

		fetch(centerURL)
			.then((response) => response.json())
			.then((data) => {
				setCenter(data);
				continueRender(waitForCenter);
			})
			.catch((err) => {
				console.error(err);
				cancelRender('Center');
			});
	}, [waitForVideoMetadata, videoURL, subtitlesURL, waitForSubtitles, centerURL, waitForCenter]);



	if (!videoData || !subtitles || !center) {
		return null;
	}

	const {durationInSeconds, height, width} = videoData

	console.log(subtitlesURL, subtitles)

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
				defaultProps={{
					video: {
						url: videoURL,
						height,
						width
					},
					subtitles,
					center
				}}
			/>
		</>
	);
};
