import { useEffect, useRef } from 'react';
import { EventEmitter } from 'eventemitter3';

const emitter = new EventEmitter();

export const useSub = (event, callback) => {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		const handler = (...args) => {
			callbackRef.current(...args);
		};

		emitter.on(event, handler);

		return () => {
			emitter.off(event, handler);
		};
	}, [event]);
};

export const usePub = () => {
	return (event, ...args) => {
		emitter.emit(event, ...args);
	};
};