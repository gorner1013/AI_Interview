import { useSub } from '@/hooks/usePubSub';
import { forwardRef, useEffect, useState } from 'react';
import { PUB_SUB_EVENT } from '@/features/constants/pubSubEvent';
import { WsMessage } from '@/types/WsMessage.type';

type HTMLFrameProps = {
	show: boolean;
	separated: boolean;
	htmltext: string;
	htmltext2: string;
};

const executeScriptsInHTML = (html) => {
	const scripts = html.getElementsByTagName('script');

	for (let i = 0; i < scripts.length; i++) {
		const script = scripts[i];
		const scriptContent = script.textContent || script.innerText || '';

		const newScript = document.createElement('script');
		newScript.innerHTML = scriptContent;
		document.body.appendChild(newScript);
	}
};

export const HTMLFrame = forwardRef((props, ref: any) => {
	const [htmlFrameProps, setHTMLFrameProps] = useState<HTMLFrameProps>({
		show: false,
		separated: false,
		htmltext: '',
		htmltext2: '',
	});

	const handleMessage = (data: WsMessage<string>) => {
		const value = data.value;

		if (value === 'close') {
			setHTMLFrameProps({
				show: false,
				separated: false,
				htmltext: '',
				htmltext2: '',
			});
		} else {
			//TODO: setHTMLFrameProps({
			// 	show: true,
			// 	separated: data.type === 'html_2',
			// 	htmltext: value,
			// 	htmltext2: data.value || '',
			// });
		}
	};

	useSub(PUB_SUB_EVENT.HTML, handleMessage);
	useSub(PUB_SUB_EVENT.HTML_2, handleMessage);

	useEffect(() => {
		const html1 = ref.current?.querySelector('#html1');
		if (html1) {
			executeScriptsInHTML(html1);
		}
		const html2 = ref.current?.querySelector('#html2');
		if (html2) {
			executeScriptsInHTML(html2);
		}
	}, [htmlFrameProps]);

	return (
		<div ref={ref}>
			{htmlFrameProps.show ? (
				htmlFrameProps.separated ? (
					<div className='absolute bottom-0 z-50 mb-[13rem] px-16 w-screen h-[calc(100vh-18rem)]'>
						<div className='grid grid-cols-2 gap-[8px] w-full h-full'>
							<div className='border w-full h-full rounded-16 bg-surface1 text-text-primary typography-16 font-M_PLUS_2 font-bold px-16 py-8'>
								<span id='html1' dangerouslySetInnerHTML={{ __html: htmlFrameProps.htmltext }} />
							</div>
							<div className='border w-full h-full rounded-16 bg-surface1 text-text-primary typography-16 font-M_PLUS_2 font-bold px-16 py-8'>
								<span id='html2' dangerouslySetInnerHTML={{ __html: htmlFrameProps.htmltext2 }} />
							</div>
						</div>
					</div>
				) : (
					<div className='absolute bottom-0 z-50 mb-[13rem] px-16 w-screen h-[calc(100vh-18rem)]'>
						<div className='border w-full h-full rounded-16 bg-surface1 text-text-primary typography-16 font-M_PLUS_2 font-bold px-16 py-8'>
							<span id='html1' dangerouslySetInnerHTML={{ __html: htmlFrameProps.htmltext }} />
						</div>
					</div>
				)
			) : (
				<></>
			)}
		</div>
	);
});

HTMLFrame.displayName = 'HTMLFrame';
