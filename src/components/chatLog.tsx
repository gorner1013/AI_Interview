import { useEffect, useRef } from 'react';
import { Message } from '@/features/messages/messages';
import { MESSAGE_ROLE } from '@/features/constants/chatMessage';

type Props = {
	messages: Message[];
};

export const ChatLog = ({ messages }: Props) => {
	const chatScrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		chatScrollRef.current?.scrollIntoView({
			behavior: 'auto',
			block: 'center',
		});
	}, []);

	useEffect(() => {
		chatScrollRef.current?.scrollIntoView({
			behavior: 'smooth',
			block: 'center',
		});
	}, [messages]);
	return (
		<div className='absolute w-col-span-6 max-w-full h-[100svh] pb-64'>
			<div className='max-h-full px-16 pt-104 pb-64 overflow-y-auto scroll-hidden'>
				{messages.map((msg, i) => {
					if (msg.role === MESSAGE_ROLE.SYSTEM) return <></>;
					return (
						<div key={i} ref={messages.length - 1 === i ? chatScrollRef : null}>
							<Chat role={msg.role} message={msg.content} />
						</div>
					);
				})}
			</div>
		</div>
	);
};

const Chat = ({ role, message }: { role: string; message: string }) => {
	const offsetX = role === MESSAGE_ROLE.USER ? 'pl-40' : 'pr-40';

	return (
		<div className={`mx-auto max-w-sm my-16 ${offsetX}`}>
			<div className={`px-24 py-8 rounded-t-8 font-Montserrat font-bold tracking-wider bg-base text-black`}>
				{role === MESSAGE_ROLE.ASSISTANT ? 'CHARACTER' : 'YOU'}
			</div>
			<div className='px-24 py-16 bg-white rounded-b-8'>
				<div className={`typography-16 font-M_PLUS_2 font-bold text-black`}>{message}</div>
			</div>
		</div>
	);
};
