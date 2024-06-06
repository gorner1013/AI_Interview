import React, { useState, useEffect, useCallback, useContext } from "react";
import {
    Message,
    textsToScreenplay,
    Screenplay,
} from "@/features/messages/messages";
import { speakCharacter } from "@/features/messages/speakCharacter";
import { getChatResponseStream } from "@/features/chat/openAiChat";
import { KoeiroParam } from "@/features/constants/koeiroParam";
import { ViewerContext } from "@/features/vrmViewer/viewerContext";

interface ChatAssistantProps {
    openAiKey: string;
    systemPrompt: string;
    koeiroParam: KoeiroParam;
}

const Airespawn: React.FC<ChatAssistantProps> = ({　openAiKey = '' , systemPrompt , koeiroParam}) => {
    const [assistantMessage, setAssistantMessage] = useState<string>("");
    const [chatProcessing, setChatProcessing] = useState<boolean>(false);
    const { viewer } = useContext(ViewerContext);

    useEffect(() => {
        if (!openAiKey) { // ここでAPIキーが存在するかをチェック
            console.error('APIキーが設定されていません。');
            return; // APIキーがなければここで処理を終了
        }
        handleChatResponse(); // これを追加してAIからの最初の応答を取得
    }, [systemPrompt, viewer, koeiroParam]);

    // OpenAIのGPTからのレスポンスを処理
    const handleChatResponse = useCallback(async () => {
        setChatProcessing(true);

        const messages: Message[] = [
            {
                role: "system",
                content: systemPrompt,
            },
            // ここにユーザーのメッセージを追加するコードが必要になります
        ];

        const stream = await getChatResponseStream(messages, openAiKey).catch(
            (e) => {
                console.error(e);
                setChatProcessing(false);
                return null;
            }
        );

        if (stream == null) {
            return;
        }

        const reader = stream.getReader();
        let receivedMessage = "";

        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                receivedMessage += value; // AIからのメッセージを取得
            }

            setAssistantMessage(receivedMessage); // 状態を更新してAIからのメッセージを表示

            // AIからのメッセージを読み上げる処理
         //   const screenplay = textsToScreenplay([receivedMessage], koeiroParam);
         //   speakCharacter(screenplay[0], viewer, "", () => {}, () => {});
        } catch (e) {
            console.error(e);
        } finally {
            reader.releaseLock();
            setChatProcessing(false);
        }
    }, [openAiKey, systemPrompt, viewer, koeiroParam]);

    return (
        <div>
            <div className="assistantMessage">
                {assistantMessage} {/* AIからのメッセージを表示 */}
            </div>
            {/* 必要に応じて他のUI要素をここに追加 */}
        </div>
    );
};

export default Airespawn;