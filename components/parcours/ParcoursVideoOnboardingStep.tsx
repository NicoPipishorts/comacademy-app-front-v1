import videoNeoImage from "@/assets/imgs/parcours/OnboardingPages/Video Neo.png";
import React from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

import ParcoursStepOnboarding from "./ParcoursStepOnboarding";

export const VIDEO_ONBOARDING_BACKGROUND = "#F8F0FC";
const VIDEO_PINK = "#CC328C";

export default function ParcoursVideoOnboardingStep({
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
	const imageSize = Math.min(Math.max(height * 0.4, 310), 410);

	return (
		<ParcoursStepOnboarding
			dateLabel={dateLabel}
			currentIndex={currentIndex}
			totalSteps={totalSteps}
			onStart={onStart}
			backgroundColor={VIDEO_ONBOARDING_BACKGROUND}
			accentColor={VIDEO_PINK}
			title={<>Video</>}
			imageSource={videoNeoImage}
			imageStyle={{ width: imageSize, height: imageSize }}
			visualStyle={styles.visualWrap}
			body={<>Mini video : maxi truc à retenir !</>}
			bodyStyle={styles.body}
		/>
	);
}

const styles = StyleSheet.create({
	visualWrap: {
		top: 200,
		bottom: 280,
	},
	body: {
		marginBottom: 46,
	},
});
