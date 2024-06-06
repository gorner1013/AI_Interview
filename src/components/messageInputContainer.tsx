import { Textbox } from '@/components/textbox';
import { Inputbox } from '@/components/inputbox';
import { Fulltext } from '@/components/fulltext';
import { useState, useEffect, useCallback } from 'react';
import { useSub } from '@/hooks/usePubSub';
import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';
import { WsMessage } from '@/types/WsMessage.type';

export enum InputMode {
	Close = 'close',
	Textbox = 'textbox',
	Inputbox = 'inputbox',
	Fulltext = 'fulltext',
	Speech = 'microphone',
}

type Props = {
	onClickSendButton: (mode: string, message: string) => void;
};

/**
 * テキスト入力を提供する
 *
 */
export const MessageInputContainer = ({ onClickSendButton }: Props) => {
	const [inputMode, setInputMode] = useState<string>(InputMode.Textbox);
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
	const [userMessage, setUserMessage] = useState<string>('');

	const handleMessage = (data: WsMessage<InputMode>) => {
		if (data.value === InputMode.Speech) {
			setInputMode('');
			return;
		}
		setInputMode(data.value);
	};

	useSub(PUB_SUB_EVENT.MODE, handleMessage);
	useSub(PUB_SUB_EVENT.SPEAK, (val: boolean) => setIsSpeaking(val));

	const handleClickSendButton = useCallback(() => {
		onClickSendButton(inputMode, userMessage);
		setUserMessage('');
	}, [inputMode, userMessage, onClickSendButton]);

	useEffect(() => {
		if (!isSpeaking) {
			setUserMessage('');
		}
	}, [isSpeaking]);

	return inputMode === InputMode.Textbox ? (
		<Textbox
			userMessage={userMessage}
			isChatProcessing={isSpeaking}
			onChangeUserMessage={(e) => setUserMessage(e.target.value)}
			onClickSendButton={handleClickSendButton}
		/>
	) : inputMode === InputMode.Inputbox ? (
		<Inputbox
			userMessage={userMessage}
			isChatProcessing={isSpeaking}
			onChangeUserMessage={(e) => setUserMessage(e.target.value)}
			onClickSendButton={handleClickSendButton}
		/>
	) : inputMode === InputMode.Fulltext ? (
		<Fulltext
			userMessage={userMessage}
			isChatProcessing={isSpeaking}
			onChangeUserMessage={(e) => setUserMessage(e.target.value)}
			onClickSendButton={handleClickSendButton}
		/>
	) : (
		<></>
	);
};
