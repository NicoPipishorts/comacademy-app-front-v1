import gameNeoImage from "@/assets/imgs/parcours/OnboardingPages/Vrai Neo.png";
import React from "react";
import { StyleSheet, Text, useWindowDimensions } from "react-native";

import ParcoursStepOnboarding from "./ParcoursStepOnboarding";

export const GAME_ONBOARDING_BACKGROUND = "#FFF8EF";
const GAME_ORANGE = "#FF9147";
const GAME_PINK = "#FF5C83";

export default function ParcoursGameOnboardingStep({
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
	const imageSize = Math.min(Math.max(height * 0.42, 325), 425);
	const visibleArtworkOffsetX = imageSize * (11.5 / 448);
	const visibleArtworkOffsetY = imageSize * (14.5 / 448);

	return (
		<ParcoursStepOnboarding
			dateLabel={dateLabel}
			currentIndex={currentIndex}
			totalSteps={totalSteps}
			onStart={onStart}
			backgroundColor={GAME_ONBOARDING_BACKGROUND}
			accentColor={GAME_ORANGE}
			stepAccentColor={GAME_PINK}
			title={
				<>
					Vrai ou <Text style={styles.titleAccent}>Faux</Text>
				</>
			}
			imageSource={gameNeoImage}
			imageStyle={{
				width: imageSize,
				height: imageSize,
				transform: [
					{ translateX: visibleArtworkOffsetX },
					{ translateY: visibleArtworkOffsetY },
				],
			}}
			visualStyle={styles.visualWrap}
			body={<>Réfléchis, swipe, gagne (ou perd) !</>}
			bodyStyle={styles.body}
		/>
	);
}

const styles = StyleSheet.create({
	titleAccent: {
		color: GAME_ORANGE,
	},
	visualWrap: {
		top: 205,
		bottom: 290,
	},
	body: {
		marginBottom: 46,
	},
});
