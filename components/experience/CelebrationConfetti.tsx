import * as Haptics from "expo-haptics";
import React, { useEffect, useMemo } from "react";
import {
	StyleSheet,
	useWindowDimensions,
	View,
	ViewStyle,
} from "react-native";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";

const CONFETTI_COLORS = [
	"#FFCA05",
	"#EE7D11",
	"#E73C7E",
	"#6CDF95",
	"#60A5FA",
	"#8B5CF6",
];

type ConfettiConfig = {
	id: number;
	xRatio: number;
	delay: number;
	duration: number;
	drift: number;
	rotation: number;
	size: number;
	color: string;
	isRound: boolean;
};

const createConfetti = (count: number): ConfettiConfig[] =>
	Array.from({ length: count }, (_, index) => {
		const seeded = (index * 47 + 19) % 101;
		return {
			id: index,
			xRatio: ((index * 37 + 11) % 97) / 100,
			delay: (index % 9) * 75 + Math.floor(index / 9) * 35,
			duration: 1900 + (seeded % 8) * 120,
			drift: ((index * 29) % 90) - 45,
			rotation: 360 + (seeded % 5) * 180,
			size: 7 + (seeded % 5),
			color: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
			isRound: index % 4 === 0,
		};
	});

function ConfettiPiece({
	config,
	screenHeight,
	screenWidth,
}: {
	config: ConfettiConfig;
	screenHeight: number;
	screenWidth: number;
}) {
	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withDelay(
			config.delay,
			withTiming(1, {
				duration: config.duration,
				easing: Easing.in(Easing.quad),
			})
		);
	}, [config.delay, config.duration, progress]);

	const animatedStyle = useAnimatedStyle<ViewStyle>(() => ({
		opacity: interpolate(progress.value, [0, 0.06, 0.88, 1], [0, 1, 1, 0]),
		transform: [
			{
				translateX: interpolate(
					progress.value,
					[0, 0.45, 1],
					[0, config.drift, config.drift * -0.35]
				),
			},
			{ translateY: progress.value * (screenHeight + 100) },
			{ rotateZ: `${progress.value * config.rotation}deg` },
		] as ViewStyle["transform"],
	}));

	return (
		<Animated.View
			style={[
				styles.piece,
				{
					left: config.xRatio * screenWidth,
					width: config.size,
					height: config.isRound ? config.size : config.size * 1.7,
					backgroundColor: config.color,
					borderRadius: config.isRound ? config.size : 2,
				},
				animatedStyle,
			]}
		/>
	);
}

export default function CelebrationConfetti() {
	const { height, width } = useWindowDimensions();
	const pieces = useMemo(() => createConfetti(42), []);

	useEffect(() => {
		void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	}, []);

	return (
		<View pointerEvents='none' style={styles.overlay}>
			{pieces.map((piece) => (
				<ConfettiPiece
					key={piece.id}
					config={piece}
					screenHeight={height}
					screenWidth={width}
				/>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	overlay: {
		...StyleSheet.absoluteFill,
		zIndex: 20,
		overflow: "hidden",
	},
	piece: {
		position: "absolute",
		top: -24,
	},
});
