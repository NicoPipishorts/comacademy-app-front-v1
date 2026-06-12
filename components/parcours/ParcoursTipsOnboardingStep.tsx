import tipsNeoImage from "@/assets/imgs/parcours/OnboardingPages/Tips Neo.png";
import React from "react";
import { StyleSheet, Text, useWindowDimensions } from "react-native";

import ParcoursStepOnboarding from "./ParcoursStepOnboarding";

export const TIPS_ONBOARDING_BACKGROUND = "#F1F8FF";
const TIPS_BLUE = "#2387CF";

export default function ParcoursTipsOnboardingStep({
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
	const imageSize = Math.min(Math.max(height * 0.43, 330), 430);
	const visibleArtworkOffsetY = imageSize * (14.5 / 469);

	return (
		<ParcoursStepOnboarding
			dateLabel={dateLabel}
			currentIndex={currentIndex}
			totalSteps={totalSteps}
			onStart={onStart}
			backgroundColor={TIPS_ONBOARDING_BACKGROUND}
			accentColor={TIPS_BLUE}
			title={
				<>
					Tips &amp; <Text style={styles.titleAccent}>tactics</Text>
				</>
			}
			titleStyle={styles.title}
			imageSource={tipsNeoImage}
			imageStyle={{
				width: imageSize,
				height: imageSize,
				transform: [{ translateY: visibleArtworkOffsetY }],
			}}
			visualStyle={styles.visualWrap}
			body={<>Sauras-tu deviner le tip du jour ?</>}
			bodyStyle={styles.body}
			supportText={
				<>Retrouve le en intégralité dans la rubrique Tips &amp; Tactics</>
			}
		/>
	);
}

const styles = StyleSheet.create({
	title: {
		fontSize: 42,
	},
	titleAccent: {
		color: TIPS_BLUE,
	},
	visualWrap: {
		top: 210,
		bottom: 320,
	},
	body: {
		marginBottom: 18,
	},
});
