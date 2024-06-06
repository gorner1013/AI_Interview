import { useEffect, useState } from 'react';
// hooks
import { usePub } from '@/hooks/usePubSub';
// constants
import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';

/** Stream関連のログPrefix */
const LOG_PREFIX = '【Stream】';

export const useStream = () => {
	const [userStream, setUserStream] = useState<MediaStream>();
	const [displayStream, setDisplayStream] = useState<MediaStream>();

	const publish = usePub();

	useEffect(() => {
		console.debug(`${LOG_PREFIX} Start useStream acquisition process.`);
		getStream();
		return () => {
			setUserStream(null);
			setDisplayStream(null);
		};
	}, []);

	const getStream = () => {
		console.debug(`${LOG_PREFIX} Start stream acquisition process.`);
		Promise.all([
			navigator.mediaDevices.getUserMedia({audio: true }),
			// navigator.mediaDevices.getDisplayMedia({ audio: true }),
		])
			.then((results) => {
				// ディスプレイのシステム音声が許可されているか確認
				if (results[0].getAudioTracks().length < 1) throw new Error('Display audio is not allowed.');
				setUserStream(results[0]);
				setDisplayStream(results[0]);
				// setDisplayStream(results[1]);
				console.debug(`${LOG_PREFIX} Stream acquisition process completed.`);
				console.log("results[0]",results[0]);
			})
			.catch((err) => {
				console.debug(`${LOG_PREFIX} Could not get stream.`);
				console.error(err);
				alert('画面共有とシステム音声の共有を許可してください。');
				location.reload();
			});
	};

	return {
		userStream,
		displayStream,
	};
};
