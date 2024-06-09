import { useEffect, useState } from 'react';
// hooks
import { usePub, useSub } from '@/hooks/usePubSub';
import { StackMessage } from './useSpeakCharacter';
import { useTimer } from './useTimer';
// constants
import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';
import { MESSAGE_ROLE } from '@/features/constants/chatMessage';
// types
import { Interview, WsMessage } from '@/types/WsMessage.type';
// library
import _ from 'lodash';
let currentInterview: Interview | null = null;

/** Interview関連のログPrefix */
const LOG_PREFIX = '【Interview】';

/** キャラクターの音声出力を処理 */
export const useInterview = (
    isMakingSpeech: boolean,
    startRecording: () => Promise<void>,
    stopRecording: () => void,
    onInterviewEnd: () => void
) => {
    /** タイマーhook */
    const { isTimerEnd, startCountDown } = useTimer();
    /** 全インタビューデータ */
    const [interviews, setInterviews] = useState<Array<Interview>>([]);
    /** インタビューが開始されたかフラグ */
    const [isInterviewStarted, setIsInterviewStarted] = useState<boolean>(false);
    /** 現在再生中のインタビューID */
    const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);

    const publish = usePub();

    /** type: interviewのイベントを処理 */
    const handleMessage = async (data: WsMessage<Interview[]>) => {
        console.debug(`${LOG_PREFIX} Received interview data:`, data);

        // データがない場合、音声出力を行わない
        if (!data || data.value.length === 0) {
            console.warn(`${LOG_PREFIX} Interview data is empty or not an array.`);
            console.warn(`${LOG_PREFIX} data:`, data);
            return;
        }
        console.debug(`${LOG_PREFIX} Setting interviews:`, data);
        setIsInterviewStarted(true);
        setInterviews(data.value);
        console.debug(`${LOG_PREFIX} Interviews updated:`, data);
    };

    // type: interviewのイベントをsubscribe
    useSub(PUB_SUB_EVENT.INTERVIEW, handleMessage);
    useSub(PUB_SUB_EVENT.INTERVIEW_END, (val: boolean) => {
        console.debug(`${LOG_PREFIX} Interview ended:`, val);
        setInterviews([]);
    });

    useEffect(() => {
        if (!isInterviewStarted) return;
        console.debug(`${LOG_PREFIX} Interview started, start recording.`);
        startRecording();
    }, [isInterviewStarted]);

    // useEffect(() => {
    //     console.debug(`${LOG_PREFIX} インタビュー処理`);
    //     console.debug(interviews);

    //     console.debug(`${LOG_PREFIX} Dependencies changed:`, { isMakingSpeech, isTimerEnd, interviews });

    //     console.debug(`${LOG_PREFIX} isMakingSpeech:`, isMakingSpeech);
    //     console.debug(`${LOG_PREFIX} isTimerEnd:`, isTimerEnd);
    //     console.debug(`${LOG_PREFIX} interviews.length:`, interviews.length);


    //     if (!isTimerEnd || !isInterviewStarted) {
    //         console.debug(`${LOG_PREFIX} Skipping interview processing due to:`, {
    //             isMakingSpeech,
    //             isTimerEnd,
    //             interviewsLength: interviews.length,
    //         });

    //         return;
    //     }

    //     if (interviews.length === 0 && isInterviewStarted && isTimerEnd) {
    //         console.debug(`${LOG_PREFIX} No more interviews, stop recording.`);
    //         stopRecording();
    //         onInterviewEnd();
    //         return;
    //     }




    //     const interview = interviews[0];
    //     console.debug(`${LOG_PREFIX} interviews[0]:`, interview);

    //     console.debug(`${LOG_PREFIX} interview:`, interview);
    //     if (!interview) {
    //         console.debug(`${LOG_PREFIX} No more interviews, stop recording.`);
    //         stopRecording();
    //         onInterviewEnd();
    //         return;
    //     }

    //     if (interview.id === currentInterviewId) {
    //         console.debug(`${LOG_PREFIX} Interview already being played, skipping:`, interview);
    //         return;
    //     }

    //     console.debug(`${LOG_PREFIX} Next interview:`, interview);
    //     publish(PUB_SUB_EVENT.ADD_CHAT_LOG, [
    //         { role: MESSAGE_ROLE.ASSISTANT, content: interview.question, prompt: interview.prompt },
    //     ]);

    //     const speakEndCallback = () => {
    //         console.debug(`${LOG_PREFIX} Speaking ended, start countdown.`);
    //         startCountDown(interview.time);
    //         setInterviews(interviews.slice(1));
    //         publish(PUB_SUB_EVENT.INTERVIEW_MESSAGE, interview);
    //         setCurrentInterviewId(null);
    //         currentInterview = interview;
    //     }
    //     const stackMessage: StackMessage = { id: interview.id, message: interview.question, koeiroData: interview.koeiroData, speakEndCallback: speakEndCallback };
    //     console.debug(`${LOG_PREFIX} Start speaking:`, stackMessage);
    //     currentInterview = interview;
    //     setCurrentInterviewId(interview.id);

    //     publish(PUB_SUB_EVENT.NEXT_INTERVIEW, stackMessage)

    // }, [interviews, isTimerEnd, isMakingSpeech, currentInterviewId, isInterviewStarted]);

    useEffect(() => {
        // インタビューの設問時間が終了したことを通知
        if (isTimerEnd) publish(PUB_SUB_EVENT.INTERVIEW_TIMEOUT, undefined);
    }, [isTimerEnd])

    return {
        isTimerEnd,
    };
};

export function getCurrentInterview(): Interview | null {
    if (currentInterview) {
        const e: Interview = { ...currentInterview };
        if (e.koeiroData) {
            e.koeiroData.audioData = [];
        }
        return e;
    }
    return null;
}