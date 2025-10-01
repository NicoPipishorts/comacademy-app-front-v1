import {
	colorGreen,
	colorOrange,
	colorRed,
	primaryBackground,
} from "@/constants/colors";
import { getPasswordRequirements } from "@/helpers/passwordRequirement";
import React, { useEffect, useMemo } from "react";
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

	const { score, color } = useMemo(() => {
		const requirements = getPasswordRequirements(password);
		const { length, uppercase, lowercase, number, special } = requirements;
		const requirementChecks = [length, uppercase, lowercase, number, special];
		const calculatedScore = requirementChecks.filter(Boolean).length;

		if (calculatedScore <= 2) {
			return { label: "Faible", score: calculatedScore, color: colorRed };
		}
		if (calculatedScore === 3) {
			return { label: "Moyen", score: calculatedScore, color: colorOrange };
		}
		if (calculatedScore === 4) {
			return { label: "Bon", score: calculatedScore, color: colorOrange };
		}
		return { label: "Fort", score: calculatedScore, color: colorGreen };
	}, [password]);

	useEffect(() => {
		// Update the shared values for animation
		filledSections.value = withTiming(score * sectionWidth, {
			duration: 500,
		});
		barColor.value = color;
	}, [barColor, color, filledSections, score, sectionWidth]);

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
