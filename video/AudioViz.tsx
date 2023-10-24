import { useCurrentFrame, useVideoConfig } from 'remotion'
import { useAudioData, visualizeAudio } from '@remotion/media-utils';

export const AudioViz: React.FC<{
	numberOfSamples: number;
	waveLinesToDisplay: number;
	mirrorWave: boolean;
	audioSrc: string;
}> = ({
	numberOfSamples,
	waveLinesToDisplay,
	mirrorWave,
	audioSrc,
}) => {
	const frame = useCurrentFrame();
	const { fps } = useVideoConfig();

	const audioData = useAudioData(audioSrc);

	if (!audioData) {
		return null;
	}

	const frequencyData = visualizeAudio({
		fps,
		frame,
		audioData,
		numberOfSamples, // Use more samples to get a nicer visualisation
	});

	// Pick the low values because they look nicer than high values
	// feel free to play around :)
	const frequencyDataSubset = frequencyData.slice(
		0,
		mirrorWave ? Math.round(waveLinesToDisplay / 2) : waveLinesToDisplay
	);

	const frequencesToDisplay = mirrorWave
		? [...frequencyDataSubset.slice(1).reverse(), ...frequencyDataSubset]
		: frequencyDataSubset;

	return (
		<div style={{
            display: 'flex',
            flexDirection: 'row',
            height: '32px',
            minHeight: '32px',
            maxHeight: '32px',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '2px'
        }}>
			{frequencesToDisplay.map((v, i) => {
				return (
					<div
						key={i}
						className="bar"
						style={{
							minWidth: '1px',
							backgroundColor: '#0f172a',
							height: `${500 * Math.sqrt(v)}%`,
						}}
					/>
				);
			})}
		</div>
	);
};