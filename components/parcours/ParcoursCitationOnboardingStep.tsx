import citationImage from "@/assets/imgs/parcours/OnboardingPages/Citation 3D.png";
import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

import ParcoursStepOnboarding from "./ParcoursStepOnboarding";

export const CITATION_ONBOARDING_BACKGROUND = "#F1F8FF";
const CITATION_PINK = "#F52686";

export default function ParcoursCitationOnboardingStep({
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
	const { height } = useWindowDimensions();
	const imageSize = Math.min(Math.max(height * 0.48, 390), 490);
	const visibleArtworkOffsetX = imageSize * (25 / 539);
	const visibleArtworkOffsetY = imageSize * (27 / 539);

	return (
		<ParcoursStepOnboarding
			dateLabel={dateLabel}
			currentIndex={currentIndex}
			totalSteps={totalSteps}
			onStart={onStart}
			backgroundColor={CITATION_ONBOARDING_BACKGROUND}
			accentColor={CITATION_PINK}
			title={<>Citations</>}
			imageSource={citationImage}
			imageStyle={{
				width: imageSize,
				height: imageSize,
				transform: [
					{ translateX: visibleArtworkOffsetX },
					{ translateY: visibleArtworkOffsetY },
				],
			}}
			visualStyle={styles.visualWrap}
			body={<>Fais apparaître la citation du jour</>}
			bodyStyle={styles.body}
		/>
	);
}

const styles = StyleSheet.create({
	visualWrap: {
		top: 195,
		bottom: 260,
	},
	body: {
		marginBottom: 46,
	},
});
