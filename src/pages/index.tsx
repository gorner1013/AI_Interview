import { useEffect, useState, useRef, useContext, useMemo } from 'react';
import VrmViewer from '@/components/vrmViewer';
import { MessageInputContainer } from '@/components/messageInputContainer';
import { M_PLUS_2, Montserrat } from 'next/font/google';
import { Menu } from '@/components/menu';
import { Meta } from '@/components/meta';
import { useWebsocket } from '@/features/websocket';
import { HTMLFrame } from '@/components/htmlframe';
import { NextButton } from '@/components/nextButton';
import { SendButton } from '@/components/sendButton';
import { useRouter } from 'next/router';
import VideoRecorder from '@/components/screenRec';
import { useSpeechInput } from '@/hooks/useSpeechInput';
import { useRecording } from '@/hooks/useRecording';
import { usePub, useSub } from '@/hooks/usePubSub';
import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';
import { useStream } from '@/hooks/useStream';
import { useSpeakCharacter } from '@/hooks/useSpeakCharacter';
import { useInterview } from '@/hooks/useInterview';
import { WsMessage } from '@/types/WsMessage.type';
import { ViewerContext } from '@/features/vrmViewer/viewerContext';
import { MESSAGE_ROLE } from '@/features/constants/chatMessage';

const m_plus_2 = M_PLUS_2({
	variable: '--font-m-plus-2',
	display: 'swap',
	preload: false,
});

const montserrat = Montserrat({
	variable: '--font-montserrat',
	display: 'swap',
	subsets: ['latin'],
});

const getValuesRecursive = (rootComponent) => {
	const data = {};

	function traverseComponent(component) {
		if (!component) {
			return;
		}

		if (component.name) {
			data[component.name] = component.value;
		}

		if (component.children && component.children.length > 0) {
			for (const child of component.children) {
				traverseComponent(child);
			}
		}
	}

	traverseComponent(rootComponent);

	return data;
};

export default function Home() {
	const router = useRouter();
	const { viewer } = useContext(ViewerContext);

	const query = router.query;
	const { interviewUuid, jobApplicantKey } = query;

	/** ユーザ入力の処理中フラグオブジェクト */
	const [isMakingSpeech, setIsMakingSpeech] = useState<boolean>(false);

	const [isInterviewStarted, setIsInterviewStarted] = useState(false);
	const [isInterviewEnded, setIsInterviewEnded] = useState(false);
	const [isConnected, setIsConnected] = useState(false);
	// マイク、ディスプレイのstream
	const { userStream, displayStream } = useStream();
	// 録画
	const { startRecording, stopRecording } = useRecording(jobApplicantKey as string,interviewUuid as string　, displayStream, userStream);
	// 音声入力
	useSpeechInput(userStream, isMakingSpeech);
	// 音声出力
	const { startSpeaking } = useSpeakCharacter(isMakingSpeech);


	// // インタビュー  IMPORTANT,IMPORTANT,IMPORTANT
	useInterview(isMakingSpeech, startRecording, stopRecording, () => {
		setIsInterviewEnded(true);
	});

	useSub(PUB_SUB_EVENT.BACKGROUND, (data: WsMessage<string>) => {
		setBgUrl(data.value);
	});
	useSub(PUB_SUB_EVENT.SCENE, (data: WsMessage<string>) => {
		viewer.changeLayout(data.value);
	});
	useSub(PUB_SUB_EVENT.USER_INPUT, (data: boolean) => {
		console.log("data", data)
		setIsMakingSpeech(data);
	});

	const [bgurl, setBgUrl] = useState('/background.png');

	// 環境変数からベースURLを取得
	const baseUrl = process.env.WS_BASE_URL;

	// WebSocket URL を組み立て
	const webSocketUrl = useMemo(() => {
		if (interviewUuid && jobApplicantKey) {
			const url = `${baseUrl}/ws/${interviewUuid}/${jobApplicantKey}`;
			console.log("WebSocket URL:", url);
			return url;
		}
		console.log("WebSocket URL is null");
		return null;
	}, [baseUrl, interviewUuid, jobApplicantKey]);

	// WebSocketの設定
	const { connect, disconnect } = useWebsocket();

	useEffect(() => {
		console.log("1useEffect - isInterviewStarted:", isInterviewStarted);
		console.log("useEffect - isConnected:", isConnected);
		console.log("useEffect - webSocketUrl:", webSocketUrl);

		if (isInterviewStarted && webSocketUrl && !isConnected) {
			console.log("Connecting to WebSocket...");
			connect(webSocketUrl, viewer);
			setIsConnected(true);
		}

		return () => {
			if (isConnected) {
				console.log("Disconnecting from WebSocket...");
				disconnect();
				setIsConnected(false);
			}
		};
	}, [isInterviewStarted, webSocketUrl, viewer]);

	const StartInterviewButton = () => {
		const handleClick = () => {
			console.log("Starting interview...");
			setIsInterviewStarted(true);
			setIsInterviewEnded(false);
		};

		return (
			<div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
				<button
					onClick={handleClick}
					className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg border-4 border-green-600 text-2xl"
				>
					面接を開始する
				</button>
			</div>
		);
	};

	const InterviewEndMessage = () => {
		return (
			<div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-50 z-50">
				<div className="text-white font-bold text-4xl">
					面接が終了しました。ありがとうございました。
				</div>
			</div>
		);
	};

	return (
		<div className={`${m_plus_2.variable} ${montserrat.variable}`}>
			{!isInterviewStarted && <StartInterviewButton />}
			{isInterviewEnded && <InterviewEndMessage />}
			<div className="absolute top-0 left-0 w-full h-full flex items-center">
				<img src={bgurl} className="w-full" alt="" />
			</div>
			<div className="relative z-10">
				<Meta />
				<Menu />
				<VrmViewer />
			</div>
			<div className="screenRec relative z-50">
				<VideoRecorder />
			</div>
		</div>
	);
}