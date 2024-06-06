// src/features/websocket.ts

import { usePub } from '@/hooks/usePubSub';
import { Interview, WsMessage } from '@/types/WsMessage.type';
import { Viewer } from './vrmViewer/viewer';

/** WebSocket関連のログPrefix */
const LOG_PREFIX = '【WebSocket】';

let socket: WebSocket | null = null;
let viewer: Viewer | null = null;
let isFirstLoad = true; // アプリがロードされた最初の1回だけtrueになるフラグ
let isConnected = false; // 接続状態を管理するフラグ
let interviewIndex = 0; // 現在の質問のインデックス

export const useWebsocket = () => {
	const publish = usePub();

	/** WebSocketのメッセージ受信イベント */
	const handleMessage = async (event) => {
		console.debug(`${LOG_PREFIX} Received message:`, event.data);
		const data: WsMessage<any> = JSON.parse(event.data);
		console.debug(`${LOG_PREFIX} Parsed message:`, data);
		publish(data.type, data);
	};

	const connect = (webSocketUrl: string, viewerInstance: Viewer) => {
		if (!webSocketUrl) return;

		console.log(`${LOG_PREFIX} Start session.`);
		console.debug(`${LOG_PREFIX} Socket URL:`, webSocketUrl);

		socket = new WebSocket(webSocketUrl);
		socket.addEventListener('message', handleMessage);
		socket.addEventListener('open', () => {
			console.log(`${LOG_PREFIX} WebSocket connection established.`);
			if (isFirstLoad) {
				socket?.send(JSON.stringify({ type: 'start' }));
				isFirstLoad = false;
			}
		});
		socket.addEventListener('close', () => {
			console.log(`${LOG_PREFIX} Socket closed.`);
		});

		viewer = viewerInstance;
		isConnected = true; // 接続状態をtrueに更新
	};

	const disconnect = () => {
		if (socket) {
			socket.removeEventListener('message', handleMessage);
			socket.close();
			socket = null;
		}
		viewer = null;
		isConnected = false; // 接続状態をfalseに更新
	};

	return { connect, disconnect };
};

export const sendMessage = (message: WsMessage<Interview>) => {
	console.log(`${LOG_PREFIX} send message`);

	if (socket && socket.readyState === WebSocket.OPEN) {
		console.debug(`${LOG_PREFIX} Send message:`, message);
		socket.send(JSON.stringify(message));
	} else {
		console.error(`${LOG_PREFIX} WebSockets are not handshaked.`);
	}
};