import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';
import { useSub } from '@/hooks/usePubSub';
import { WsMessage } from '@/types/WsMessage.type';
import { useState } from 'react';

type Props = {
	onClick: (e: any) => void;
};

export const SendButton = ({ onClick }: Props) => {
	const [isShow, setIsShow] = useState<boolean>();

	// const handleMessage = (data: WsMessage<string>) => {
	// 	setIsShow(data.button === 'show');
	// };

	// useSub(PUB_SUB_EVENT.HTML, handleMessage);
	// useSub(PUB_SUB_EVENT.HTML_2, handleMessage);

	return isShow ? (
		<button
			onClick={onClick}
			className='absolute bottom-0 mb-[3rem] right-0 mr-[10rem] z-30 font-bold px-24 py-16 bg-primary hover:bg-primary-hover active:bg-primary-press disabled:bg-primary-disabled text-white rounded-16 text-sm text-center inline-flex items-center'
		>
			送信
		</button>
	) : (
		<></>
	);
};
