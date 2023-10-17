import {Composition, continueRender, delayRender, staticFile} from 'remotion';
import {Main, schema} from './Composition';
import './style.css';
import { useEffect, useState } from 'react';
import { VideoMetadata, getVideoMetadata } from '@remotion/media-utils';

export const RemotionRoot: React.FC = () => {
	const src = staticFile('video.mp4');

	const [handle] = useState(() => delayRender());
	const [videoData, setVideoData] = useState<VideoMetadata | null>(null);

	useEffect(() => {
		getVideoMetadata(src)
			.then((data) => {
				setVideoData(data);
				continueRender(handle);
			})
			.catch((err) => {
				console.error(err);
			});
	}, [handle, src])

	if (!videoData) {
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
				defaultProps={{
					video: {
						url: src,
						height,
						width
					}
				}}
			/>
		</>
	);
};
