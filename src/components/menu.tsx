import React, { useEffect, useState } from 'react';
import { IconButton } from './iconButton';
import { Message } from '@/features/messages/messages';
import { ChatLog } from './chatLog';
import { usePub, useSub } from '@/hooks/usePubSub';
import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';
import _ from 'lodash';
import { MESSAGE_ROLE, SYSTEM_PROMPT } from '@/features/constants/chatMessage';

/** インタビュー終了判定文字数 */
const MAX_USER_INPUT_LENGTH = 500;

export const Menu = () => {
	/** メッセージ */
	const [newLogs, setNewLogs] = useState<Array<Message>>([]);
	/** 会話ログリスト */
	const [chatLogs, setChatLogs] = useState<Array<Message>>([]);
	/** 会話ログ表示フラグ */
	const [showChatLog, setShowChatLog] = useState(false);

	const publish = usePub();

	const addChatLog = (logs: Array<Message>) => {
		let copy = _.cloneDeep(chatLogs);
		// promptを取得(直近のインタビューのプロンプトをユーザのメッセージに設定するため)
		let prompt;
		const interview = copy.findLast((v) => v.prompt);
		if (interview) prompt = SYSTEM_PROMPT[interview.prompt];

		let targets = logs.map((v) => {
			if (v.role !== MESSAGE_ROLE.USER || !prompt) return v;
			v.prompt = prompt;
			return v;
		});

		copy = copy.concat(targets);
		setChatLogs(copy);
	};

	useSub(PUB_SUB_EVENT.ADD_CHAT_LOG, (data: Array<Message>) => {
		setNewLogs(data);
	});

	useEffect(() => {
		if (newLogs.length < 1) return;
		addChatLog(newLogs);
	}, [newLogs]);

	useEffect(() => {
		if (!chatLogs || chatLogs.length < 1) return;
		const role = chatLogs[chatLogs.length - 1].role;
		if (role !== MESSAGE_ROLE.USER) return;

		// userのログのメッセージ文字数をチェック(500文字超えていたら、interview自体終了)
		const userLogs = chatLogs.filter((v) => v.role === MESSAGE_ROLE.USER);
		const characterLength = userLogs.map((v) => v.content).join().length;
		if (characterLength >= MAX_USER_INPUT_LENGTH) publish(PUB_SUB_EVENT.INTERVIEW_END, true);

		const requestMessage: Array<Message> = chatLogs.map((v) => {
			// promptをcontentに設定(roleが"user"の場合のみ)
			let content = v.content;
			if (v.role === MESSAGE_ROLE.USER && v.prompt) content = `${v.prompt}${v.content}`;
			return { role: v.role, content: content };
		});
		publish(PUB_SUB_EVENT.SEND, { type: 'message', value: requestMessage });
	}, [chatLogs]);

	return (
		<>
			<div className='absolute z-10 m-24'>
				<div className='grid grid-flow-col gap-[8px]'>
					<IconButton
						iconName={showChatLog ? '24/CommentOutline' : '24/CommentFill'}
						label='会話ログ'
						isProcessing={false}
						disabled={chatLogs.length <= 0}
						onClick={() => setShowChatLog(!showChatLog)}
					/>
				</div>
			</div>
			{showChatLog && <ChatLog messages={chatLogs} />}
		</>
	);
};
