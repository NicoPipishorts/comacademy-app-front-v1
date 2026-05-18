import { colorWhite } from "@/constants/colors";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

export default function BottomFeedbackSheet({
	title,
	subtitle,
	backgroundColor,
	onHide,
	durationMs = 500,
	height = 236,
	titleSize = 84,
	subtitleSize = 18,
	textColor = colorWhite,
}: {
	title: string;
	subtitle?: string | null;
	backgroundColor: string;
	onHide: () => void;
	durationMs?: number;
	height?: number;
	titleSize?: number;
	subtitleSize?: number;
	textColor?: string;
}) {
	const slideAnim = useSharedValue(height + 60);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		slideAnim.value = withTiming(0, { duration: 250 });

		timerRef.current = setTimeout(() => {
			slideAnim.value = withTiming(height + 60, { duration: 250 }, (finished) => {
				if (finished) {
					runOnJS(onHide)();
				}
			});
		}, durationMs);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [durationMs, height, onHide, slideAnim, title, subtitle]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: slideAnim.value }],
	}));

	return (
		<Animated.View
			style={[
				animatedStyle,
				styles.feedbackContainer,
				{ backgroundColor, height },
			]}>
			<View style={styles.content}>
				<Text style={[styles.title, { fontSize: titleSize, color: textColor }]}>
					{title}
				</Text>
				{subtitle ? (
					<Text
						style={[
							styles.subtitle,
							{ fontSize: subtitleSize, color: textColor },
						]}>
						{subtitle}
					</Text>
				) : null}
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	feedbackContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 500,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		shadowColor: "rgb(0, 0, 0)",
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 0.4,
		shadowRadius: 20,
		elevation: 50,
		pointerEvents: "none",
		paddingHorizontal: 24,
	},
	content: {
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
	},
	title: {
		color: colorWhite,
		fontWeight: "bold",
		textAlign: "center",
	},
	subtitle: {
		color: colorWhite,
		fontWeight: "700",
		textAlign: "center",
		lineHeight: 24,
		maxWidth: 320,
	},
});
