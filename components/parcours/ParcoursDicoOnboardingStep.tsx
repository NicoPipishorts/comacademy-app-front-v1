import quizNeoImage from "@/assets/imgs/parcours/OnboardingPages/Quiz Neo.png";
import { colorGreen } from "@/constants/colors";
import React from "react";
import { StyleSheet, Text } from "react-native";

import ParcoursStepOnboarding from "./ParcoursStepOnboarding";

export const DICO_ONBOARDING_BACKGROUND = "#EFF8F1";

export default function ParcoursDicoOnboardingStep({
	dateLabel,
	currentIndex,
	totalSteps,
	onStart,
}: {
	dateLabel: string;
	currentIndex: number;
	totalSteps: number;
	onStart: () => void;
}) {
	return (
		<ParcoursStepOnboarding
			dateLabel={dateLabel}
			currentIndex={currentIndex}
			totalSteps={totalSteps}
			onStart={onStart}
			backgroundColor={DICO_ONBOARDING_BACKGROUND}
			accentColor='#77D986'
			title={
				<>
					Dico <Text style={styles.titleAccent}>Quizz</Text>
				</>
			}
			imageSource={quizNeoImage}
			body={<>Voyons si tu parles vraiment la langue de la com&apos;...</>}
			wrapperStyle={styles.wrapper}
			topMetaStyle={styles.topMeta}
			visualStyle={styles.visualWrap}
		/>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		alignItems: "center",
		paddingHorizontal: 30,
	},
	topMeta: {
		left: 30,
		right: 30,
	},
	titleAccent: {
		color: colorGreen,
	},
	visualWrap: {
		position: "relative",
		flex: 1,
		marginRight: -50,
	},
});
