// useRecording.ts
import { useEffect,useCallback, useRef } from 'react';

const MIME_TYPE = {
	WEBM: 'video/webm; codecs="vp9,opus',
	MP4: 'video/mp4; codecs="avc,aac',
};

export const useRecording = (jobApplicantKey: string,interviewUuid:string ,displayStream: MediaStream, userStream: MediaStream) => {
	const mediaRecorder = useRef<MediaRecorder | null>(null);
	const mediaChunks = useRef<Blob[]>([]);

	/** 録画したデータをサーバにアップロード */
	const uploadVideo = async (url, blob) => {
		console.log('[Recording] upload recorded data');
		const formData = new FormData();
		formData.append('video', blob, `${jobApplicantKey}.mp4`);
		formData.append('jobApplicantKey', jobApplicantKey);
		formData.append('interviewUuid', interviewUuid);

		let response;
		try {
			response = await fetch(`${process.env.HTTP_BASE_URL}/interview_videos`, { method: 'POST', body: formData });
		} catch (error) {
			console.error('Error during upload:', error);
			return;
		}

		if (response.ok) {
			console.log('Video uploaded successfully');
		} else {
			console.error('Failed to upload video');
		}
	};

	const createRecorderOptions = () => {
		const options: MediaRecorderOptions = {};

		const { WEBM, MP4 } = MIME_TYPE;
		let mimeType;
		if (MediaRecorder.isTypeSupported(MP4)) {
			mimeType = MP4;
		} else if (MediaRecorder.isTypeSupported(WEBM)) {
			mimeType = WEBM;
		}
		options.mimeType = mimeType;

		return options;
	};

	const onRecordingActive = useCallback(({ data }: BlobEvent) => {
		mediaChunks.current.push(data);
	}, []);

	const onRecordingStart = useCallback(() => {
		console.log('[Recording] START');
		console.debug(mediaRecorder.current);
	}, []);

	const onRecordingStop = useCallback(() => {
		console.log('[Recording] STOP');
		const mimeType = mediaRecorder.current.mimeType;
		const type = mimeType.split(';')[0];
		const blobProperty: BlobPropertyBag = { type: 'video/mp4' };
		const blob = new Blob(mediaChunks.current, blobProperty);
		const url = URL.createObjectURL(blob);

		uploadVideo(url, blob);
	}, [jobApplicantKey, mediaChunks]);

	const onRecordingError = useCallback(() => {
		console.log('[Recording] ERROR');
	}, []);

	/** デスクトップの音声とマイクの音声をマージする */
	const mergeAudioStreams = (desktopStream, voiceStream) => {
		const context = new AudioContext();
		const destination = context.createMediaStreamDestination();

		const desktopSource = context.createMediaStreamSource(desktopStream);
		const desktopGain = context.createGain();
		desktopGain.gain.value = 0.3;
		desktopSource.connect(desktopGain).connect(destination);

		const voiceSource = context.createMediaStreamSource(voiceStream);
		const voiceGain = context.createGain();
		voiceGain.gain.value = 0.7;
		voiceSource.connect(voiceGain).connect(destination);

		return destination.stream.getAudioTracks();
	};

	// useEffect(() => {
	// 	console.log("startRecording Function");
	// 	startRecording();
		
	//   }, []);

	/** 録画開始 */
	const startRecording = async () => {
		// 画面の音声トラックとマイクの音声トラックをマージ
		const audioStream = mergeAudioStreams(displayStream, userStream);
		// const audiotract=userStream.getAudioTracks
		// mimeTypeを設定
		const stream = new MediaStream([...audioStream, ...displayStream.getVideoTracks()]);
		const recorderOptions = createRecorderOptions();
		const recorder = new MediaRecorder(stream, recorderOptions);
		recorder.ondataavailable = onRecordingActive;
		recorder.onstart = onRecordingStart;
		recorder.onerror = onRecordingError;
		recorder.start(1000);
		mediaRecorder.current = recorder;
		console.log('レコーディング開始', audioStream);
		console.log('STREAM', stream);
	};

	// const startRecording = async () => {
	// 	// 画面の音声トラックとマイクの音声トラックをマージ
	// 	const audioStream = mergeAudioStreams(displayStream, userStream);
	// 	// const audiotract=userStream.getAudioTracks
	// 	// mimeTypeを設定
	// 	const stream = new MediaStream([...audioStream, ...displayStream.getVideoTracks()]);
	// 	const recorderOptions = createRecorderOptions();
	// 	const recorder = new MediaRecorder(stream, recorderOptions);
	// 	recorder.ondataavailable = onRecordingActive;
	// 	recorder.onstart = onRecordingStart;
	// 	recorder.onerror = onRecordingError;
	// 	recorder.start(1000);
	// 	mediaRecorder.current = recorder;
	// 	console.log('レコーディング開始');
	// };

	/** 録画を停止 */
	const stopRecording = () => {
		mediaRecorder.current.onstop = onRecordingStop;
		mediaRecorder.current.stop();
		console.log('レコーディング終了');
	};

	return {
		startRecording,
		stopRecording,
	};
};