import { colorBlack, colorGrey } from "@/constants/colors";
import { FontSize14 } from "@/constants/fontsizes";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

const TIMER_SIZE = 64;
const STROKE_WIDTH = 5;
const RADIUS = (TIMER_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const formatSeconds = (value: number) => {
	const clamped = Math.max(0, value);
	const minutes = Math.floor(clamped / 60);
	const seconds = clamped % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export default function ParcoursStepTimer({
	durationSeconds = 15,
	accentColor,
	onComplete,
}: {
	durationSeconds?: number;
	accentColor: string;
	onComplete?: () => void;
}) {
	const [remainingSeconds, setRemainingSeconds] = useState(durationSeconds);
	const hasCompletedRef = useRef(false);

	useEffect(() => {
		setRemainingSeconds(durationSeconds);
		hasCompletedRef.current = false;

		const interval = setInterval(() => {
			setRemainingSeconds((current) => {
				if (current <= 1) {
					clearInterval(interval);
					return 0;
				}

				return current - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [durationSeconds]);

	useEffect(() => {
		if (remainingSeconds !== 0 || hasCompletedRef.current) {
			return;
		}

		hasCompletedRef.current = true;
		onComplete?.();
	}, [onComplete, remainingSeconds]);

	const progress = useMemo(
		() => (durationSeconds - remainingSeconds) / Math.max(durationSeconds, 1),
		[durationSeconds, remainingSeconds]
	);
	const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

	return (
		<View style={styles.container}>
			<Svg width={TIMER_SIZE} height={TIMER_SIZE} style={styles.svg}>
				<Circle
					cx={TIMER_SIZE / 2}
					cy={TIMER_SIZE / 2}
					r={RADIUS}
					stroke={colorGrey}
					strokeWidth={STROKE_WIDTH}
					fill='none'
				/>
				<Circle
					cx={TIMER_SIZE / 2}
					cy={TIMER_SIZE / 2}
					r={RADIUS}
					stroke={accentColor}
					strokeWidth={STROKE_WIDTH}
					fill='none'
					strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap='round'
					rotation={-90}
					originX={TIMER_SIZE / 2}
					originY={TIMER_SIZE / 2}
				/>
			</Svg>
			<View style={styles.labelWrap}>
				<Text style={styles.label}>{formatSeconds(remainingSeconds)}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		width: TIMER_SIZE,
		height: TIMER_SIZE,
		alignItems: "center",
		justifyContent: "center",
	},
	svg: {
		position: "absolute",
	},
	labelWrap: {
		alignItems: "center",
		justifyContent: "center",
	},
	label: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorBlack,
	},
});
