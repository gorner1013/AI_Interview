import { useEffect, useRef, useState } from "react";
// hooks
import { usePub, useSub } from "@/hooks/usePubSub";
// constants
import { PUB_SUB_EVENT } from "@/features/constants/pubSubEvent";
import { MESSAGE_ROLE } from "@/features/constants/chatMessage";
// types
import { sendMessage } from "@/features/websocket";
import { getCurrentInterview } from "./useInterview";

/** Speech関連のログPrefix */
const LOG_PREFIX = "【Speech】";

/** 音声入力チェックインターバル値 */
const CHECK_INPUT_INTERVAL = 1 * 1000;

/** 音声入力を処理 */
export const useSpeechInput = (
  userStream: MediaStream,
  isMakingSpeech: boolean
) => {
  const speechRecognition = useRef<SpeechRecognition>();
  /** 音声入力テキスト */
  const [speechInputText, setSpeechInputText] = useState<string>("");
  /** 音声入力可能フラグ */
  const [isRecognitionActive, setIsRecognitionActive] =
    useState<boolean>(false);

  const publish = usePub();

  /** SpeechRecognitionの設定を行う */
  const setUpSpeechRecognition = () => {
    console.debug(`${LOG_PREFIX} Setting up SpeechRecognition...`);
    speechRecognition.current = new (window.SpeechRecognition ||
      window.webkitSpeechRecognition)();
    speechRecognition.current.continuous = true;
    speechRecognition.current.interimResults = true;
    speechRecognition.current.lang = "en-US";

    speechRecognition.current.onresult = speechResult;
    speechRecognition.current.onspeechstart = speechStart;
    speechRecognition.current.onspeechend = speechEnd;
    speechRecognition.current.onerror = speechError;

    console.debug(`${LOG_PREFIX} SpeechRecognition setup completed.`);
  };

  /** 音声入力開始処理 */
  const startSpeech = () => {
    try {
      speechRecognition.current.start();
      console.debug(`${LOG_PREFIX} Speech recognition started.`);
    } catch (err) {
      // do nothing
    }
  };

  /** 音声入力停止処理 */
  const stopSpeech = () => {
    try {
      speechRecognition.current.stop();
      console.debug(`${LOG_PREFIX} Speech recognition stopped.`);
    } catch (err) {
      // do nothing
    }
  };

  /** 音声認識の開始処理 */
  const speechStart = () => {
    console.debug(`${LOG_PREFIX} Speech started.`);
    publish(PUB_SUB_EVENT.USER_INPUT, true);
  };

  /** 音声認識の終了処理 */
  const speechEnd = () => {
    console.debug(`${LOG_PREFIX} Speech ended.`);
    publish(PUB_SUB_EVENT.USER_INPUT, false);
  };

  /** 音声入力結果イベント */
  const speechResult = (event: SpeechRecognitionEvent) => {
    const results = event.results;
    const lastResult = results[results.length - 1];
    const transcript = lastResult[0].transcript;

    console.debug(`${LOG_PREFIX} Speech recognition result:`, transcript);

    if (lastResult.isFinal) {
      const inputValue = transcript.trim();
      if (inputValue !== "") {
        setSpeechInputText((prevText) =>
          prevText ? `${prevText} ${inputValue}` : inputValue
        );
      }
    }
  };

  /** 音声入力エラーイベント */
  const speechError = (event) => {
    const errorText = event.error;
    console.error(`${LOG_PREFIX} Speech recognition error:`, errorText);
    publish(PUB_SUB_EVENT.USER_INPUT, false);
  };

  useSub(PUB_SUB_EVENT.SPEAK, (val: boolean) => {
    // キャラクターがしゃべり始めたら、音声入力をストップ
    if (val) {
      setIsRecognitionActive(false);
      return;
    }
    // キャラクターがしゃべり終えたら、音声入力開始
    setIsRecognitionActive(true);
  });
  // インタビューが終了した場合、音声入力をストップ
  useSub(PUB_SUB_EVENT.INTERVIEW_END, () => setIsRecognitionActive(false));
  // インタビューの設問時間が終了した場合、音声入力をストップ
  useSub(PUB_SUB_EVENT.INTERVIEW_TIMEOUT, () => setIsRecognitionActive(false));
  // インタビューの出力が終了した場合、音声入力を再度開始
  useSub(PUB_SUB_EVENT.INTERVIEW_MESSAGE, () => setIsRecognitionActive(true));

  useEffect(() => {
    console.debug(`${LOG_PREFIX} userStream changed:`, userStream);
    // マイクの音声入力を受け取ったタイミングでspeechRecognitionオブジェクトを生成
    if (!userStream) return;
    setUpSpeechRecognition();
    setIsRecognitionActive(true);
  }, [userStream]);

  useEffect(() => {
    if (!userStream) return;

    let stopIntervalId;
    let startIntervalId;
    // 音声入力の開始・終了を定期的に実施し、音声入力が止まらないようにする
    if (!isRecognitionActive) {
      clearInterval(startIntervalId);
      stopIntervalId = window.setInterval(() => {
        stopSpeech();
      }, CHECK_INPUT_INTERVAL);
    } else {
      clearInterval(stopIntervalId);
      startIntervalId = window.setInterval(() => {
        startSpeech();
      }, CHECK_INPUT_INTERVAL);
    }
    console.debug(
      `${LOG_PREFIX} Recognition active state changed:`,
      isRecognitionActive
    );

    return () => {
      clearInterval(stopIntervalId);
      clearInterval(startIntervalId);
    };
  }, [userStream, isRecognitionActive]);

  useEffect(() => {
    // 音声入力で取得したテキストをサーバに送信
    if (speechInputText) {
      const timer = setTimeout(() => {
        publish(PUB_SUB_EVENT.USER_INPUT, false);
        publish(PUB_SUB_EVENT.ADD_CHAT_LOG, [
          { role: MESSAGE_ROLE.USER, content: speechInputText },
        ]);
        console.debug(
          `${LOG_PREFIX} Speech input text sent to server:`,
          speechInputText
        );
        let currentInterviewCopy = getCurrentInterview();

        console.debug(
          `${LOG_PREFIX} currentInterviewCopy input text sent to server:`,
          currentInterviewCopy
        );

        if (currentInterviewCopy) {
          currentInterviewCopy.userInput = speechInputText;
          sendMessage({
            type: "message",
            value: currentInterviewCopy,
          });
        }
        setSpeechInputText("");
        speechRecognition.current.abort();
      }, 500);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [speechInputText]);
};
