import {
	BottomSheetBackdropProps,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import React, { useCallback } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function BlurBackdrop({
	animatedIndex,
	style,
}: BottomSheetBackdropProps) {
	const { dismiss } = useBottomSheetModal();

	// Fade the blur with the sheet
	const animatedStyle = useAnimatedStyle(() => {
		return { opacity: animatedIndex.value > -1 ? 1 : 0 };
	});

	// Wrap dismiss (boolean return) into a void-returning handler
	const handlePress = useCallback(() => {
		dismiss(); // ignore boolean; we don't need the return value
	}, [dismiss]);

	return (
		<Pressable
			style={StyleSheet.absoluteFill}
			onPress={handlePress}
			// ensure the pressable sits above content behind
			pointerEvents='auto'>
			<AnimatedBlurView
				style={[StyleSheet.absoluteFill, style, animatedStyle]}
				tint='dark'
				intensity={40}
				// For Android SDK 51+, you can try:
				// experimentalBlurMethod="dimezisBlurView"
			/>
		</Pressable>
	);
}
