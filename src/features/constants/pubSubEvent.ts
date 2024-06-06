export const PUB_SUB_EVENT = {
	SEND: 'send',
	SCENE: 'scene',
	MODE: 'mode',
	BACKGROUND: 'background',
	BUTTON: 'button',
	MESSAGE: 'message',
	HTML: 'html',
	HTML_2: 'html_2',
	INTERVIEW: 'interview',

	/** チャットログ追加(テキスト入力時、音声入力時、インタビュー音声出力時) */
	ADD_CHAT_LOG: 'addChatLog',
	/** インタビューメッセージ出力終了(チャットログ、音声入力再開) */
	INTERVIEW_MESSAGE: 'interviewMessage',
	/** 音声出力開始・終了(キャラクターがしゃべる、しゃべり終える) */
	SPEAK: 'speak',
	/** 音声入力開始・終了(ユーザがしゃべる、しゃべり終える), テキスト入力 */
	USER_INPUT: 'userInput',
	/** チャットログのユーザ発言の文字数が制限を超えた、インタビューを最後まで終えた */
	INTERVIEW_END: 'interviewEnd',
	/** 次のインタビュー処理 */
	NEXT_INTERVIEW: "nextInterview",
	/** インタビュータイムアウト */
	INTERVIEW_TIMEOUT: 'interviewTimeout',
};
