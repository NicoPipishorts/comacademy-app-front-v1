import {
	colorGreen,
	colorOrange,
	colorRed,
	primaryBackground,
} from "@/constants/colors";
import { getPasswordRequirements } from "@/helpers/passwordRequirement";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";

interface Props {
	password: string;
}

export default function PasswordStrengthMeter({ password }: Props) {
	const sectionWidth = 20; // Each section is 20% of the total width
	const filledSections = useSharedValue(0);
	const barColor = useSharedValue("red");

	// Validate password requirements
	const passwordRequirements = getPasswordRequirements(password);

	// Calculate password strength
	const calculateStrength = () => {
		const { length, uppercase, lowercase, number, special } =
			passwordRequirements;
		const score = [length, uppercase, lowercase, number, special].filter(
			Boolean
		).length;

		if (score <= 2) return { label: "Faible", score, color: colorRed };
		if (score === 3) return { label: "Moyen", score, color: colorOrange };
		if (score === 4) return { label: "Bon", score, color: colorOrange };
		return { label: "Fort", score, color: colorGreen };
	};

	useEffect(() => {
		// Update the shared values for animation
		const { score, color } = calculateStrength();
		filledSections.value = withTiming(score * sectionWidth, {
			duration: 500,
		});
		barColor.value = color;
	}, [password]);

	// Create derived values for the animated style
	const animatedStyle = useAnimatedStyle(() => ({
		width: `${filledSections.value}%`, // Ensure it's a percentage
		backgroundColor: barColor.value, // Access shared value
	}));

	return (
		<>
			{/* Strength Meter */}
			<View style={styles.strengthMeterContainer}>
				<Animated.View style={[styles.filledBar, animatedStyle]} />
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	strengthMeterContainer: {
		width: "100%",
		height: 10,
		backgroundColor: primaryBackground,
		borderRadius: 5,
		overflow: "hidden",
		marginBottom: 20,
		flexDirection: "row",
		justifyContent: "flex-start",
	},
	filledBar: {
		alignSelf: "flex-start", // Explicitly align to the start
		height: "100%",
		backgroundColor: "green",
		borderRadius: 5,
	},
});
