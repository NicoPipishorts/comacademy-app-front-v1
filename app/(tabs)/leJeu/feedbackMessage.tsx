import { colorGreen, colorPink, colorWhite } from "@/constants/colors";
import { Answer } from "@/types/enums";
import React, { useEffect, useRef } from "react";
import { StyleSheet, Text } from "react-native";
import Animated, {
	runOnJS,
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

interface FeedbackMessageProps {
	answer: Answer;
	onHide: () => void;
	isHomeButtonModel: boolean;
}

export default function FeedbackMessage({
	answer,
	onHide,
	isHomeButtonModel,
}: FeedbackMessageProps) {
	const slideAnim = useSharedValue(250);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		if (timerRef.current) {
			clearTimeout(timerRef.current);
		}

		slideAnim.value = withTiming(0, { duration: 250 });

		timerRef.current = setTimeout(() => {
			slideAnim.value = withTiming(250, { duration: 250 }, (finished) => {
				if (finished) {
					runOnJS(onHide)();
				}
			});
		}, 500);

		return () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current);
				timerRef.current = null;
			}
		};
	}, [answer, slideAnim, onHide]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: slideAnim.value }],
	}));

	// Get background color based on answer
	const getBackgroundColor = () => {
		switch (answer) {
			case Answer.true:
				return colorGreen;
			case Answer.false:
				return colorPink;
			default:
				return colorPink; // fallback
		}
	};

	// Format answer text for display
	const getDisplayText = () => {
		if (typeof answer === "string") {
			return answer.charAt(0).toUpperCase() + answer.slice(1);
		}
		return String(answer);
	};

	return (
		<Animated.View
			style={[
				animatedStyle,
				styles.feedbackContainer,
				{
					backgroundColor: getBackgroundColor(),
					height: isHomeButtonModel ? 200 : 300,
				},
			]}>
			<Text style={styles.feedbackText}>{getDisplayText()}</Text>
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
	},
	feedbackText: {
		fontSize: 100,
		color: colorWhite,
		fontWeight: "bold",
		textAlign: "center",
	},
});
