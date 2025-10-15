import { primaryBackground } from "@/constants/colors";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	runOnJS,
} from "react-native-reanimated";

const SwipeToGoBack = ({ children }) => {
	const navigation = useNavigation();
	const translateX = useSharedValue(0);

	const panGesture = Gesture.Pan()
		.activeOffsetX([-10, 10])
		.failOffsetY([-10, 10])
		.onUpdate((event) => {
			translateX.value = Math.max(0, event.translationX);
		})
		.onEnd((event) => {
			if (event.translationX > 100) {
				runOnJS(navigation.goBack)();
			}
			translateX.value = withSpring(0);
		});

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	return (
		<GestureDetector gesture={panGesture}>
			<Animated.View style={[styles.container, animatedStyle]}>
				{children}
			</Animated.View>
		</GestureDetector>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
});

export default SwipeToGoBack;
