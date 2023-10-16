import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    cancelRender,
	continueRender,
	delayRender,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import { Easing } from 'remotion';
import { interpolate } from 'remotion';
import { Transcript } from '../src/models/transcript';
import { ensureFont } from './ensure-font';

const useWindowedFrameSubs = (
	transcription: Transcript,
	options: { windowStart: number; windowEnd: number }
) => {
	const { windowStart, windowEnd } = options;
	const config = useVideoConfig();
	const { fps } = config;


	return useMemo(() => {
		return transcription
			.map((item) => {
				const start = Math.floor(item.start * fps);
				const end = Math.floor(item.end * fps);
				return { item, start, end };
			})
			.filter(({ start }) => {
				return start >= windowStart && start <= windowEnd;
			})
			.map<{text: string, start: number, end: number}>(({ item, start, end }) => {
				return {
					...item,
					start,
					end,
				};
			}, []);
	}, [fps, transcription, windowEnd, windowStart]);
};

const Word: React.FC<{
	item: {text: string, start: number, end: number};
	frame: number;
	transcriptionColor: string;
}> = ({ item, frame, transcriptionColor }) => {
	const opacity = interpolate(frame, [item.start, item.start + 15], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const translateY = interpolate(
		frame,
		[item.start, item.start + 10],
		[0.25, 0],
		{
			easing: Easing.out(Easing.quad),
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		}
	);

	return (
		<span
			style={{
				display: 'inline-block',
				opacity,
				translate: `0 ${translateY}em`,
				color: transcriptionColor,
			}}
		>
			{item.text}
		</span>
	);
};

export const PaginatedSubtitles: React.FC<{
	subtitles: Transcript;
	startFrame: number;
	endFrame: number;
	linesPerPage: number;
	subtitlesZoomMeasurerSize: number;
    fontSize: number;
	onlyDisplayCurrentSentence: boolean;
}> = ({
	startFrame,
	endFrame,
	subtitles,
	linesPerPage,
	subtitlesZoomMeasurerSize,
    fontSize,
    onlyDisplayCurrentSentence,
}) => {
	const frame = useCurrentFrame();
	const windowRef = useRef<HTMLDivElement>(null);
	const zoomMeasurer = useRef<HTMLDivElement>(null);
	const [handle] = useState(() => delayRender());
    const [fontHandle] = useState(() => delayRender());
	const [fontLoaded, setFontLoaded] = useState(false);
	const windowedFrameSubs = useWindowedFrameSubs(subtitles, {
		windowStart: startFrame,
		windowEnd: endFrame,
	});

	const [lineOffset, setLineOffset] = useState(0);

	const currentAndFollowingSentences = useMemo(() => {
		// If we don't want to only display the current sentence, return all the words
		if (!onlyDisplayCurrentSentence) return windowedFrameSubs;

        // @ts-expect-error findLastIndex is not in the types
		const indexOfCurrentSentence = windowedFrameSubs.findLastIndex((w, i) => {
				const nextWord = windowedFrameSubs[i + 1];

				return (
					nextWord &&
					(w.text.endsWith('?') ||
						w.text.endsWith('.') ||
						w.text.endsWith('!')) &&
					nextWord.start < frame
				);
			}) + 1;

		return windowedFrameSubs.slice(indexOfCurrentSentence);
	}, [frame, onlyDisplayCurrentSentence, windowedFrameSubs]);

	useEffect(() => {
		if (!fontLoaded) {
			return;
		}
		const zoom =
			(zoomMeasurer.current?.getBoundingClientRect().height as number) /
			subtitlesZoomMeasurerSize;
		const linesRendered =
			(windowRef.current?.getBoundingClientRect().height as number) /
			(fontSize * zoom);
		const linesToOffset = Math.max(0, linesRendered - 6);
        console.log(zoom, linesRendered, linesToOffset)
		setLineOffset(linesToOffset);
		continueRender(handle);
	}, [
		fontLoaded,
		frame,
		handle,
        fontSize,
		linesPerPage,
        subtitlesZoomMeasurerSize,
	]);

    useEffect(() => {
		ensureFont()
			.then(() => {
				continueRender(fontHandle);
				setFontLoaded(true);
			})
			.catch((err) => {
				cancelRender(err);
			});
	}, [fontHandle, fontLoaded]);

	const currentFrameSentences = currentAndFollowingSentences.filter((word) => {
		return word.start < frame;
	});

	return (
		<div
			style={{
				position: 'relative',
				overflow: 'hidden',
				paddingBottom: '20px',
                fontSize,
                fontFamily: 'Inter',
			}}
		>
			<div
				ref={windowRef}
				style={{
					transform: `translateY(-${lineOffset * fontSize}px)`,
				}}
			>
				{currentFrameSentences.map((item) => (
					<span key={`${item.start}-${item.text}`} id={String(item.start)}>
						<Word
							frame={frame}
							item={item}
							transcriptionColor="#0f172a"
						/>{' '}
					</span>
				))}
			</div>
			<div
				ref={zoomMeasurer}
				style={{
					height: subtitlesZoomMeasurerSize,
					width: subtitlesZoomMeasurerSize,
				}}
			/>
		</div>
	);
};