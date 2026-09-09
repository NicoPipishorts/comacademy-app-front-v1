import { colorBlack } from "@/constants/colors";
import { FontSize14 } from "@/constants/fontsizes";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Centre of the "Parcours" icon in the tab bar: it is the middle of five equal
// flex:1 tabs, and TabBar stacks paddingBottom 6 + 2 + 8, the label, marginBottom
// 6 and half of the 42pt icon container above the bottom inset.
const TAB_ICON_ABOVE_INSET = 57;
const TAB_COUNT = 5;

const TRAVEL_DURATION = 460;
const START_SCALE = 0.25;
const OVERSHOOT = 1.06;
const IMPACT_SCALE = 0.86;
const SETTLE = { damping: 6, stiffness: 320, mass: 0.6 };

type Props = {
	onPress: () => void;
	/** Play the entrance once, when the sheet that revealed it closes. */
	animateIn?: boolean;
	/** Tab the link shoots out from: Accueil 0, Jeu 1, Parcours 2, Feed 3, Moi 4. */
	tabIndex: number;
};

/**
 * "A propos" entry point for a section. On first reveal it shoots out from behind
 * that section's tab icon and slams into its slot.
 */
export default function SectionAboutCta({
	onPress,
	animateIn = false,
	tabIndex,
}: Props) {
	const insets = useSafeAreaInsets();
	const wrapperRef = useRef<View>(null);
	const [origin, setOrigin] = useState<{ dx: number; dy: number } | null>(null);

	// 0 = tucked behind the tab icon, 1 = resting in the header. Seeded at the
	// start pose when an entrance is due, otherwise the link flashes in its slot
	// for the frame between mount and the measure that feeds the animation.
	const progress = useSharedValue(animateIn ? 0 : 1);
	const scale = useSharedValue(animateIn ? START_SCALE : 1);
	const opacity = useSharedValue(animateIn ? 0 : 1);
	const played = useRef(false);

	const handleLayout = useCallback(() => {
		wrapperRef.current?.measureInWindow((x, y, width, height) => {
			setOrigin({
				dx:
					(SCREEN_WIDTH * (tabIndex + 0.5)) / TAB_COUNT - (x + width / 2),
				dy:
					SCREEN_HEIGHT -
					insets.bottom -
					TAB_ICON_ABOVE_INSET -
					(y + height / 2),
			});
		});
	}, [insets.bottom, tabIndex]);

	useEffect(() => {
		if (!animateIn || !origin || played.current) {
			return;
		}

		played.current = true;
		progress.value = 0;
		scale.value = START_SCALE;
		opacity.value = 0;

		opacity.value = withTiming(1, { duration: 140 });

		// Overshoots the slot, then springs back - the slam lands past its mark.
		progress.value = withSequence(
			withTiming(OVERSHOOT, {
				duration: TRAVEL_DURATION,
				easing: Easing.in(Easing.cubic),
			}),
			withSpring(1, SETTLE)
		);

		scale.value = withSequence(
			withTiming(1, {
				duration: TRAVEL_DURATION,
				easing: Easing.in(Easing.cubic),
			}),
			withTiming(IMPACT_SCALE, { duration: 80 }),
			withSpring(1, SETTLE)
		);
	}, [animateIn, origin, opacity, progress, scale]);

	const animatedStyle = useAnimatedStyle(() => {
		const remaining = 1 - progress.value;
		return {
			opacity: opacity.value,
			transform: [
				{ translateX: (origin?.dx ?? 0) * remaining },
				{ translateY: (origin?.dy ?? 0) * remaining },
				{ scale: scale.value },
			] as const,
		};
	});

	return (
		<View ref={wrapperRef} onLayout={handleLayout}>
			<Animated.View style={animatedStyle}>
				<Text
					style={styles.label}
					onPress={onPress}
					accessibilityRole='button'
					accessibilityLabel='A propos de cette section'
					suppressHighlighting>
					A propos
				</Text>
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	label: {
		fontSize: FontSize14,
		fontWeight: "700",
		color: colorBlack,
		textDecorationLine: "underline",
		paddingVertical: 8,
		paddingLeft: 12,
	},
});
