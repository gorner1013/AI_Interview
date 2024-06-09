import { useState, useEffect, useCallback } from "react";
import { IconButton } from "./iconButton";

type Props = {
  userMessage: string;
  isChatProcessing: boolean;
  onChangeUserMessage: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onClickSendButton: (event: string) => void;
};

export const SpeechInput = ({
  userMessage,
  isChatProcessing,
  onChangeUserMessage,
  onClickSendButton,
}: Props) => {
  const [speechRecognition, setSpeechRecognition] =
    useState<SpeechRecognition>();
  const [isMicRecording, setIsMicRecording] = useState(false);

  const handleRecognitionResult = useCallback(
    (event: SpeechRecognitionEvent) => {
      const text = event.results[0][0].transcript;
      onClickSendButton(text);
    },
    [onChangeUserMessage, onClickSendButton]
  );

  const handleRecognitionEnd = useCallback(() => {
    setIsMicRecording(false);
  }, []);

  const handleClickMicButton = useCallback(() => {
    if (isMicRecording) {
      speechRecognition?.stop();
      setIsMicRecording(false);
      return;
    }

    speechRecognition.start();
    setIsMicRecording(true);
  }, [isMicRecording, speechRecognition]);

  useEffect(() => {
    const SpeechRecognition =
      window.webkitSpeechRecognition || window.SpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "ja-JP";
    recognition.interimResults = false; // 認識の途中結果を返す
    recognition.continuous = false; // 発言の終了時に認識を終了する

    recognition.addEventListener("result", handleRecognitionResult);
    recognition.addEventListener("end", handleRecognitionEnd);

    setSpeechRecognition(recognition);
  }, [handleRecognitionResult, handleRecognitionEnd]);

  return isMicRecording ? (
    <button
      className="w-[48px] h-[48px] bg-[#ff0000] rounded-[20%] border border-2 border-[#f0f0f0] opacity-70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:bg-[#ff7f7f]"
      onClick={handleClickMicButton}
    />
  ) : (
    <button
      className="w-[48px] h-[48px] bg-[#ff0000] rounded-[9999px] border border-2 border-[#f0f0f0] opacity-70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:bg-[#ff7f7f]"
      onClick={handleClickMicButton}
    />
  );
};
