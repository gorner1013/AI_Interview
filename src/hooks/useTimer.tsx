import { useEffect, useState } from 'react';

/** Timer関連のログPrefix */
const LOG_PREFIX = '【Timer】';

/** タイマー処理を処理 */
export const useTimer = () => {
	/** 残り時間 */
	const [remainingTime, setRemainingTime] = useState<number>(0);
	/** カウントダウン中かフラグ */
	const [isCountDown, setIsCountDown] = useState<boolean>(false);
	/** カウントダウン終了フラグ */
	const [isTimerEnd, setIsTimerEnd] = useState<boolean>(true);

	/** カウントダウン開始 */
	const startCountDown = (time) => {
		console.debug(`${LOG_PREFIX} start timer with remaining time: ${time}`);
		setRemainingTime(time);
		setIsTimerEnd(false);
		setIsCountDown(true);
	};

	/** カウントダウン停止 */
	const stopCountDown = () => {
		console.debug(`${LOG_PREFIX} stop timer`);
		setIsCountDown(false);
	};

	useEffect(() => {
		if (!isCountDown) {
			console.debug(`${LOG_PREFIX} countdown is not active`);
			return;
		}

		console.debug(`${LOG_PREFIX} remaining time: ${remainingTime}`);

		if (remainingTime < 1) {
			console.debug(`${LOG_PREFIX} timer end`);
			setIsCountDown(false);
			setIsTimerEnd(true);
			return;
		}

		const countDown = () => {
			window.setTimeout(() => {
				setRemainingTime(remainingTime - 1);
			}, 1000);
		};
		countDown();
	}, [remainingTime, isCountDown]);

	return {
		isTimerEnd,
		startCountDown,
		stopCountDown,
	};
};