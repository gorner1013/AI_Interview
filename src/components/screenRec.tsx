import React, { useCallback, useEffect, useRef, useState } from 'react';

const Recorder: React.FC = () => {
	
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		// getStream()
	}, [])

	const getStream = async () => {
		// streamを取得
		let stream
		try {
			stream = await navigator.mediaDevices.getUserMedia({video: { width: 427,height: 240 }});
		} catch(err) {
			console.error('カメラ取得エラー', err);
			return
		}
		videoRef.current.srcObject = stream
	}

	return (
		<div>
			<video ref={videoRef} autoPlay></video>
		</div>
	);
};

export default Recorder;