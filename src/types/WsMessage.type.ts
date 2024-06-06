// src/types/WsMessage.type.ts

export type KoeiroData = {
	/** koeiromapで作成した合成音声データ */
	audioData: string[];
	/** koeiromapで使用したパラメータ */
	koeiroParam: KoeiroParam;
};

export type KoeiroParam = {
	speakerX: number;
	speakerY: number;
	style: 'happy' | 'angry' | 'sad' | 'surprised' | 'talk' | 'fear';
	message: string; // 追加

};

export type WsMessage<T> = {
	type: WsMessageType;
	value?: T;
	voice_data?: string;
};

export type Interview = {
	id: string;
	question: string;
	time: number;
	prompt: string;
	userInput?: string;
	koeiroData: KoeiroData;
};

export type WsMessageType = 'interview' | 'message' | 'question' | 'end';