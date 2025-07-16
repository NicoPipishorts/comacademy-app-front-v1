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
	isHomeButtonModel: boolean;
}

export default function FeedbackMessage({
	answer,
	onHide,
	isHomeButtonModel,
}: FeedbackMessageProps) {
	// Ensure starting off-screen each mount
	const slideAnim = useSharedValue(250);

	useEffect(() => {
		// Slide in
		slideAnim.value = withTiming(0, { duration: 250 });

		// Auto-hide after 500ms
		const timer = setTimeout(() => {
			slideAnim.value = withTiming(250, { duration: 250 }, (finished) => {
				if (finished) {
					runOnJS(onHide)();
				}
			});
		}, 500);

		return () => clearTimeout(timer);
	}, [slideAnim, onHide]);

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateY: slideAnim.value }],
	}));

	return (
		<Animated.View
			style={[
				animatedStyle,
				styles.feedbackContainer,
				{
					backgroundColor: answer === Answer.true ? colorGreen : colorPink,
					height: isHomeButtonModel ? 200 : 300,
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
		justifyContent: "center",
		alignItems: "center",
		zIndex: 15,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		shadowColor: "rgb(0, 0, 0)",
		shadowOffset: { width: 0, height: 5 },
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
