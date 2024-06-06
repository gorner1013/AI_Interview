// src/features/messages/speakCharacter.ts

import { wait } from "@/utils/wait";
import { Viewer } from "../vrmViewer/viewer";
import { Screenplay } from "./messages";
import { Interview } from "@/types/WsMessage.type";

const createSpeakCharacter = () => {
    return async (
        screenplay: Screenplay,
        viewer: Viewer,
        audioDataArray: string[],
        onStart?: () => void,
        onComplete?: () => void
    ) => {
        if (!audioDataArray || audioDataArray.length === 0) return;

        onStart?.();

        try {
            if (viewer.model) {
                for (const audioData of audioDataArray) {
                    const audioBuffer = await fetchAudioData(audioData);
                    await viewer.model.speak(audioBuffer, screenplay);
                }
            } else {
                throw new Error("Viewer model is not available.");
            }

            onComplete?.();
        } catch (error) {
            console.error('Error playing audio data:', error);
            // エラーハンドリングの処理を追加する
            // 例えば、エラーメッセージを表示するなど
            alert('音声データの再生に失敗しました。');
        }
    };
};

const fetchAudioData = async (audioData: string): Promise<ArrayBuffer> => {
    const response = await fetch(audioData);
    const arrayBuffer = await response.arrayBuffer();
    return arrayBuffer;
};

export const speakCharacter = createSpeakCharacter();