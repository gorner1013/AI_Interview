import { VRMExpressionPresetName } from '@pixiv/three-vrm';
import {KoeiroParam} from "@/types/WsMessage.type";

// ChatGPT API
export type Message = {
	role: 'assistant' | 'system' | 'user';
	content: string;
	prompt?: string;
};

const talkStyles = ['talk', 'happy', 'sad', 'angry', 'fear', 'surprised'] as const;
export type TalkStyle = (typeof talkStyles)[number];

export type Talk = {
	style: TalkStyle;
	speakerX: number;
	speakerY: number;
	message: string;
};

const emotions = ['neutral', 'happy', 'angry', 'sad', 'relaxed'] as const;
type EmotionType = (typeof emotions)[number] & VRMExpressionPresetName;

/**
 * 発話文と音声の感情と、モデルの感情表現がセットになった物
 */
export type Screenplay = {
	expression: EmotionType;
	talk: Talk;
};

export const splitSentence = (text: string): string[] => {
	const splitMessages = text.split(/(?<=[。．！？\n])/g);
	return splitMessages.filter((msg) => msg !== '');
};

export const textsToScreenplay = (texts: string[], koeiroParam: KoeiroParam): Screenplay[] => {
	const screenplays: Screenplay[] = [];
	let prevExpression = 'neutral';
	for (let i = 0; i < texts.length; i++) {
		const text = texts[i];

		const match = text.match(/\[(.*?)\]/);

		const tag = (match && match[1]) || prevExpression;

		const message = text.replace(/\[(.*?)\]/g, '');

		let expression = prevExpression;
		if (emotions.includes(tag as any)) {
			expression = tag;
			prevExpression = tag;
		}

		screenplays.push({
			expression: expression as EmotionType,
			talk: {
				style: koeiroParam.style,
				speakerX: koeiroParam.speakerX,
				speakerY: koeiroParam.speakerY,
				message: message,
			},
		});
	}

	return screenplays;
};
