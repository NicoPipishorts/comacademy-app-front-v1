import {
	BottomSheetBackdropProps,
	useBottomSheetModal,
} from "@gorhom/bottom-sheet";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import Animated, {
	Extrapolation,
	interpolate,
	runOnJS,
	useAnimatedReaction,
	useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function BlurBackdrop({
	animatedIndex,
	style,
}: BottomSheetBackdropProps) {
	const { dismiss } = useBottomSheetModal();
	const [interactive, setInteractive] = useState(false);

	// Toggle touch only while visible so it doesn't block the app after close
	useAnimatedReaction(
		() => animatedIndex.value > -1,
		(isVisible) => runOnJS(setInteractive)(isVisible),
		[animatedIndex]
	);

	// Fade *with* the sheet's animation to avoid the 1s lag
	const rStyle = useAnimatedStyle(() => ({
		opacity: interpolate(
			animatedIndex.value,
			[-1, 0],
			[0, 1],
			Extrapolation.CLAMP
		),
	}));

	return (
		<Animated.View
			// Ensure full-screen coverage regardless of library internals
			style={[StyleSheet.absoluteFill, style, rStyle]}
			pointerEvents={interactive ? "auto" : "none"}>
			{/* Tap outside closes by calling the sheet's own dismiss (keeps timing in sync) */}
			<Pressable style={StyleSheet.absoluteFill} onPress={() => dismiss()}>
				<AnimatedBlurView
					style={StyleSheet.absoluteFill}
					tint='dark'
					intensity={60}
					// If Android blur is faint, try:
					// experimentalBlurMethod="dimezisBlurView"
				/>
				{/* Optional subtle dim so blur reads better */}
				<Animated.View
					pointerEvents='none'
					style={[
						StyleSheet.absoluteFill,
						rStyle,
						{ backgroundColor: "rgba(0,0,0,0.15)" },
					]}
				/>
			</Pressable>
		</Animated.View>
	);
}
