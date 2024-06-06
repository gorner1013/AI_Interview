import { useState, useEffect, useCallback } from "react";
import { useMediaRecorder, RecordingStatusEnum } from '@devmartynov/react-media-recorder';

export const Recording = ({ handleUpload, show }) => {

  const { recording, startRecording, stopRecording, status } = useMediaRecorder();

  const isMicRecording = status === RecordingStatusEnum.RECORDING;

  useEffect(() => {
    if (!recording) return;
    (async () => {
      const data = await fetch(recording).then((res) => res.blob());
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        if (base64data.match(/^data:audio\/([a-zA-Z0-9+]+);base64,/)) {
          handleUpload(base64data);
        }
      };
      reader.readAsDataURL(data);
    })();
  }, [recording]);

  return show ? (
    isMicRecording ? (
      <button
        className="w-[48px] h-[48px] bg-[#ff0000] rounded-[20%] border border-2 border-[#f0f0f0] opacity-70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:bg-[#ff7f7f]"
        onClick={stopRecording}
      />
    ) : (
      <button
        className="w-[48px] h-[48px] bg-[#ff0000] rounded-[9999px] border border-2 border-[#f0f0f0] opacity-70 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 hover:bg-[#ff7f7f]"
        onClick={startRecording}
      />
    )) : ( <></> );
};
