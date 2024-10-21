import { colorGreen, colorPink, colorWhite } from "@/constants/colors";
import { Answer } from "@/types/enums";
import React, { useEffect } from "react";
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
}

export default function FeedbackMessage({
	answer,
	onHide,
}: FeedbackMessageProps) {
	const slideAnim = useSharedValue(300); // Initial position off-screen

	useEffect(() => {
		// Slide in animation
		slideAnim.value = withTiming(0, { duration: 300 });

		// Auto-hide after 800ms
		const timer = setTimeout(() => {
			// Slide out before hiding
			slideAnim.value = withTiming(300, { duration: 300 }, (isFinished) => {
				if (isFinished) {
					runOnJS(onHide)(); // Call onHide when animation finishes
				}
			});
		}, 500);

		return () => clearTimeout(timer);
	}, [slideAnim, onHide]);

	// Animated styles for Reanimated
	const animatedStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateY: slideAnim.value }],
		};
	});

	return (
		<Animated.View
			style={[
				animatedStyle,
				styles.feedbackContainer,
				{
					backgroundColor: answer === Answer.true ? colorGreen : colorPink,
				},
			]}>
			<Text style={styles.feedbackText}>{answer}</Text>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	feedbackContainer: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		height: 300,
		justifyContent: "center",
		alignItems: "center",
		zIndex: 15,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		shadowColor: "rgb(0, 0, 0)",
		shadowOffset: {
			width: 0,
			height: 5,
		},
		shadowOpacity: 0.4,
		shadowRadius: 20,
		elevation: 10,
	},
	feedbackText: {
		fontSize: 100,
		color: colorWhite,
		fontWeight: "bold",
	},
});
