import React from "react";
import {
	Image,
	ImageSourcePropType,
	ImageStyle,
	Pressable,
	StyleProp,
	ViewStyle,
} from "react-native";

type Props = {
	source: ImageSourcePropType;
	onPress?: () => void;
	containerStyle?: StyleProp<ViewStyle>;
	imageStyle?: StyleProp<ImageStyle>;
	accessibilityLabel?: string;
	disabled?: boolean;
};

/**
 * Zero-animation action icon button.
 * Uses Pressable's style callback for a lightweight pressed effect.
 * No Animated.timing / Animated.loop anywhere (prevents pending-callback leaks).
 */
export default function ActionIconButton({
	source,
	onPress,
	containerStyle,
	imageStyle,
	accessibilityLabel,
	disabled,
}: Props) {
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole='button'
			accessibilityLabel={accessibilityLabel}
			disabled={disabled}
			style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }, containerStyle]}
			hitSlop={8}>
			<Image source={source} style={imageStyle as any} resizeMode='contain' />
		</Pressable>
	);
}
