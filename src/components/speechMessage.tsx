import React, { useEffect, useState, useRef } from 'react';

interface SpeechRecognitionComponentProps {
    handleSendTranscript: (message: string) => void;
}

const SpeechRecognitionComponent: React.FC<SpeechRecognitionComponentProps> = ({ handleSendTranscript }) => {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>('');
    const [recognitionStopped, setRecognitionStopped] = useState<boolean>(false); // 追加
    const retryCountRef = useRef(0);

    const maxRetries = 5; //再接続可能数
    const retryInterval = 30000; //再接続時のインターバル秒数

    let isRunning = false; // recognitionが実行中かどうかを示す変数

    const restartRecognition = (recognition) => {
        if (retryCountRef.current < maxRetries) {
            setTimeout(() => {
                console.log('再接続中...');
                isRunning = true; // recognitionが開始されたらフラグを立てる
                recognition.start();
            }, retryInterval);
            retryCountRef.current++;
        } else {
            console.log('最大リトライ回数に達しました。再接続を停止します。');
            isRunning = false; // recognitionが終了したらフラグをリセットする
            setErrorMessage('ネットワークが不安定な状態かカメラまたはマイクの接続許可がされていないため、面接を行うことができません。');
        }
    };

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = false;

                recognition.onresult = event => {
                    const newTranscript = Array.from(event.results)
                        .map(result => result[0].transcript)
                        .join('');
                    console.log('Transcript:', newTranscript);
                    setTranscript(prev => {
                        const updatedTranscript = prev + newTranscript;
                        if (updatedTranscript.length >= 500) {
                            recognition.stop();
                            isRunning = false; // recognitionが終了したらフラグをリセットする
                            console.log('500文字を超えました。録音を終了します。');
                            setRecognitionStopped(true);  // 追加
                        }
                        return updatedTranscript;
                    });
                };

                recognition.onend = () => {
                    console.log('音声認識サービスが切断されました。');
                    if (!recognitionStopped) {  // 追加
                        restartRecognition(recognition);
                    }
                };

                recognition.onerror = event => {
                    console.log('音声認識エラー:', event.error);
                    restartRecognition(recognition);
                };

                recognition.start();
                isRunning = true; // recognitionが開始されたらフラグを立てる
            })
            .catch(error => {
                console.error('Media Devices Error:', error);
                setErrorMessage('ネットワークが不安定か、カメラまたはマイクの接続許可がされていないため、面接を行うことができません。');
            });
    }, [recognitionStopped]);  // 追加

    useEffect(() => {
        console.log('useEffect Transcript:', transcript)
        if (transcript) {
            handleSendTranscript(transcript)
        }
    }, [transcript]);

    return (
        <div>
            {errorMessage ? (
                <div className="error-message">{errorMessage}</div>
            ) : (
                <div>Speech Recognition Component</div>
            )}
        </div>
    );
}

export default SpeechRecognitionComponent;