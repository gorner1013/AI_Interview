import { useContext, useEffect, useState } from 'react';
// hooks
import { usePub, useSub } from '@/hooks/usePubSub';
// constants
import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';
import { MESSAGE_ROLE } from '@/features/constants/chatMessage';
// features
import { textsToScreenplay } from '@/features/messages/messages';
import { ViewerContext } from '@/features/vrmViewer/viewerContext';
import { speakCharacter } from '@/features/messages/speakCharacter';
// types
import {Interview, KoeiroData, WsMessage} from '@/types/WsMessage.type';
// library
import _ from 'lodash';
import { getCurrentInterview } from './useInterview';

export type StackMessage = {
	id: string
	message: string;
	koeiroData: KoeiroData;
	speakStartCallback?: () => void,
	speakEndCallback?: () => void
};

/** Speech関連のログPrefix */
const LOG_PREFIX = '【SpeechCharacter】';

/** 次のメッセージをキャラクターにしゃべらせるまでのインターバル */
const NEXT_SPEACH_INTERVAL = 3 * 1000;

/** キャラクターの音声出力を処理 */
export const useSpeakCharacter = (isMakingSpeech: boolean) => {
	const { viewer } = useContext(ViewerContext);
	/** メッセージstack */
	const [stackMessages, setStackMessages] = useState<Array<StackMessage>>([]);
	/** 音声出力中かフラグ */
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

	const publish = usePub();

	/** type: messageのイベントを処理 */
	const handleMessage = (data: WsMessage<Interview>) => {
		// データがない場合、音声出力を行わない
		if (!data.value || !data.value.koeiroData) {
			return;
		}
		const copy = _.cloneDeep(stackMessages);
		copy.push({ id: data.value.id, message: data.value.question, koeiroData: data.value.koeiroData });
		setStackMessages(copy);
	};

	/** 受信したテキストメッセージをキャラクターにしゃべらせる */
	const startSpeaking = (stackMessage: StackMessage, onstart: () => void, onend: () => void) => {
		// メッセージの先頭を取り出す
		console.debug(`${LOG_PREFIX} speaking data`);
		console.debug(stackMessage);
		const { message, koeiroData } = stackMessage;
		const { audioData, koeiroParam } = koeiroData;

		const aiTalks = textsToScreenplay([message], koeiroParam);
		const screenplay = aiTalks[0];
		speakCharacter(
			screenplay,
			viewer,
			audioData,
			() => handleStartSpeaking(onstart),
			() => handleEndSpeaking(onend)
		);
	};

	const handleStartSpeaking = (onstart: () => void) => {
		console.debug(`${LOG_PREFIX} start speaking`);
		publish(PUB_SUB_EVENT.SPEAK, true);
		onstart?.();
	};

	const handleEndSpeaking = (onend: () => void) => {
		window.setTimeout(() => {
			console.debug(`${LOG_PREFIX} end speaking`);
			onend?.();
			publish(PUB_SUB_EVENT.SPEAK, false);
		}, NEXT_SPEACH_INTERVAL);
	};

	// type: messageのイベントをsubscribe
	useSub(PUB_SUB_EVENT.MESSAGE, handleMessage);
	useSub(PUB_SUB_EVENT.SPEAK, (val: boolean) => setIsSpeaking(val));
	useSub(PUB_SUB_EVENT.NEXT_INTERVIEW, (val: StackMessage) => setStackMessages([val]))

	useEffect(() => {
		if (isSpeaking || stackMessages.length < 1 || isMakingSpeech) return;
		const copy = _.cloneDeep(stackMessages);
		const stackMessage = copy.shift();
		const currentInterview = getCurrentInterview()
		if(currentInterview.id === stackMessage.id) {
			publish(PUB_SUB_EVENT.ADD_CHAT_LOG, [{ role: MESSAGE_ROLE.ASSISTANT, content: stackMessage.message }]);
			startSpeaking(stackMessage, stackMessage.speakStartCallback, stackMessage.speakEndCallback);
		}
		setStackMessages(copy)
	}, [stackMessages, isSpeaking, isMakingSpeech]);

	return {
		startSpeaking,
	};
};
