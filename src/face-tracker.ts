import * as tf from '@tensorflow/tfjs'
import * as facemesh from '@tensorflow-models/facemesh'
import '@tensorflow/tfjs-backend-wasm';

type Coordinates = {
  x: number
  y: number
}

const getKey = (frame: number, src: string, trackEachFrames: number) =>
	['coordinates', frame, src, trackEachFrames].join('-');

const saveCalculatedFrame = (
	frame: number,
	src: string,
  trackEachFrames: number,
	coordinate: Coordinates | null
) => {
	const key = getKey(frame, src, trackEachFrames);
	localStorage.setItem(
		key,
		coordinate === null ? 'null' : JSON.stringify(coordinate)
	);
};

export const loadCalculateFrame = (frame: number, src: string, trackEachFrames: number): Coordinates | null | undefined => {
  const key = getKey(frame, src, trackEachFrames);
  const content = localStorage.getItem(key)
  if (!content) return undefined
  if (content === 'null') return null
  return JSON.parse(content)
}

const trackFrame = async (video: HTMLVideoElement, frame: number, trackEachFrames: number, fps: number, model: facemesh.FaceMesh) => {
  const loadedCalculateFrame = loadCalculateFrame(frame, video.src, trackEachFrames)
  
  if (loadedCalculateFrame !== undefined) {
    return loadedCalculateFrame
  }

  return new Promise<Coordinates | null>((resolve) => {
      video.currentTime = frame / fps;
      video.requestVideoFrameCallback(async () => {
        const predictions = await model.estimateFaces(video, false, false);
        if (!predictions.length) return null

        // @ts-expect-error - Error with the type of the library
        const [trackingPoints] = predictions[0].annotations.noseTip

        const [x, y] = trackingPoints

        saveCalculatedFrame(frame, video.src, trackEachFrames, { x, y })
        return resolve({ x, y })
      });
    });
}

const startTracking = async (video: HTMLVideoElement, trackEachFrames: number, fps: number) => {
  const time = video.duration
  const frames = Math.floor(time * fps)

  await tf.ready()
  await tf.setBackend('cpu')
  const model = await facemesh.load()

  const coordinates: Record<number, Coordinates> = {}
  for (let i = 0; i < frames; i++) {
    if (i % trackEachFrames !== 0) continue

    console.time(`Tracking frame ${i}`)
    const frameCoordinate = await trackFrame(video, i, trackEachFrames, fps, model)
    if (frameCoordinate !== null) {
      coordinates[i] = frameCoordinate
    } else {
      console.log(`Frame ${i} not found`)
    }
    console.timeEnd(`Tracking frame ${i}`)
  }

  return coordinates
}

export const faceTracker = async (videoURL: string, eachXFrames: number, fps: number) => {
  const video = document.createElement('video')
  video.src = videoURL

  const coordinates = await new Promise<Record<number, Coordinates>>((resolve) => {
    video.addEventListener('loadedmetadata', async () => {
      const coordinates = await startTracking(video, eachXFrames, fps)
      resolve(coordinates)
    })
  })

  return coordinates
}