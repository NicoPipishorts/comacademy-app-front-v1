import { primaryBackground } from "@/constants/colors";
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { StyleSheet } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
} from "react-native-reanimated";

const SwipeToGoBack = ({ children }) => {
	const navigation = useNavigation();
	const translateX = useSharedValue(0);

	const handleGesture = ({ nativeEvent }) => {
		if (nativeEvent.state === State.END && nativeEvent.translationX > 100) {
			// Trigger navigation back if swipe exceeds 100px
			navigation.goBack();
		} else {
			// Reset position if swipe is insufficient
			translateX.value = withSpring(0);
		}
	};

	const animatedStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }],
	}));

	return (
		<PanGestureHandler
			onGestureEvent={(event) =>
				(translateX.value = event.nativeEvent.translationX)
			}
			onHandlerStateChange={handleGesture}>
			<Animated.View style={[styles.container, animatedStyle]}>
				{children}
			</Animated.View>
		</PanGestureHandler>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
});

export default SwipeToGoBack;
