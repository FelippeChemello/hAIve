import {Composition, getInputProps} from 'remotion';
import {Landscape, schema} from './Landscape';
import {Portrait} from './Portrait';
import './style.css';

export const RemotionRoot: React.FC = () => {
    const { duration } = getInputProps()

	return (
		<>
			<Composition
				id="Landscape"
				component={Landscape}
				durationInFrames={Number(duration) || 165 * 30}
				fps={30}
				width={1280}
				height={720}
				schema={schema}
				defaultProps={{
					scriptPath: '2023_10_11-00_39_38/script-with-metadata.json'
				}}
			/>
            <Composition
				id="Portrait"
				component={Portrait}
				durationInFrames={Number(duration) || 165 * 30}
				fps={30}
				width={720}
				height={1280}
				schema={schema}
				defaultProps={{
					scriptPath: '2023_10_11-00_39_38/script-with-metadata.json'
				}}
			/>
		</>
	);
};
