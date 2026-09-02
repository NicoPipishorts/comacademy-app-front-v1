import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import {
	colorBlack,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";
import { logDevice } from "@/helpers/logDevice";

export default function ParcoursFloatingNav({
	canAdvance,
	isCompleting,
	isFirstStep,
	onQuit,
	onBack,
	onNext,
	nextLabel,
	bottomOffset,
	accentColor,
}: {
	canAdvance: boolean;
	isCompleting: boolean;
	isFirstStep: boolean;
	onQuit: () => void;
	onBack: () => void;
	onNext: () => void;
	nextLabel: string;
	bottomOffset: number;
	accentColor: string;
}) {
	const nextDisabled = !canAdvance || isCompleting;

	return (
		<View pointerEvents='box-none' style={[styles.floatingNav, { bottom: bottomOffset }]}>
			<Pressable onPress={isFirstStep ? onQuit : onBack} style={styles.quitButton}>
				<View style={styles.quitIconWrap}>
					<Ionicons name='arrow-back' size={18} color={colorWhite} />
				</View>
				<Text style={styles.quitLabel}>{isFirstStep ? "Quitter" : "Retour"}</Text>
			</Pressable>
			<Pressable
				disabled={nextDisabled}
				accessibilityState={{ disabled: nextDisabled }}
				onPress={() => {
					logDevice("[Parcours][Next button] press attempt", {
						canAdvance,
						isCompleting,
						disabled: nextDisabled,
						nextLabel,
					});
					if (!nextDisabled) {
						onNext();
					}
				}}
				style={[
					styles.nextButton,
					{ backgroundColor: accentColor },
					nextDisabled && styles.nextButtonDisabled,
				]}>
				<View style={styles.nextIconWrap}>
					<Ionicons name='arrow-forward' size={18} color={accentColor} />
				</View>
				<Text style={styles.nextLabel}>{nextLabel}</Text>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	floatingNav: {
		position: "absolute",
		left: 24,
		right: 24,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	quitButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		backgroundColor: colorWhite,
		borderRadius: 999,
		paddingLeft: 10,
		paddingRight: 18,
		paddingVertical: 10,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 14 },
		shadowOpacity: 0.16,
		shadowRadius: 24,
		elevation: 10,
	},
	quitIconWrap: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: colorBlack,
		alignItems: "center",
		justifyContent: "center",
	},
	quitLabel: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
	},
	nextButton: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: colorPink,
		borderRadius: 999,
		paddingLeft: 10,
		paddingRight: 20,
		paddingVertical: 10,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 14 },
		shadowOpacity: 0.15,
		shadowRadius: 24,
		elevation: 8,
	},
	nextButtonDisabled: {
		opacity: 0.45,
	},
	nextIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 17,
		backgroundColor: colorWhite,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 10,
	},
	nextLabel: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorWhite,
	},
});
