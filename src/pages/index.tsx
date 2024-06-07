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
	

	return (
		<div >
			Hello
		</div>
	);
}