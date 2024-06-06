import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';
import { useSub } from '@/hooks/usePubSub';
import { WsMessage } from '@/types/WsMessage.type';
import { useState } from 'react';

type Props = {
	onClick: (e: any) => void;
	disabled?: boolean;
};

export const NextButton = ({ onClick, disabled }: Props) => {
	/** ボタンを表示フラグ */
	const [isShow, setIsShow] = useState<boolean>(false);
	/** マイク入力中、または音声出力中かフラグ */
	const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

	/** type: buttonのイベントを処理 */
	const handleMessage = (data: WsMessage<boolean>) => {
		setIsShow(data.value);
	};

	// type: buttonのイベントをsubscribe
	useSub(PUB_SUB_EVENT.BUTTON, handleMessage);
	useSub(PUB_SUB_EVENT.SPEAK, (val: boolean) => setIsSpeaking(val));

	return isShow ? (
		<button
			onClick={onClick}
			className='absolute bottom-0 mb-[3rem] right-0 mr-[4rem] z-50 font-bold px-24 py-16 bg-primary hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled text-white rounded-16 text-sm text-center inline-flex items-center'
			disabled={isSpeaking}
		>
			次へ
		</button>
	) : (
		<></>
	);
};
