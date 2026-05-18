import BottomFeedbackSheet from "@/components/experience/BottomFeedbackSheet";
import { colorBlack, colorWhite } from "@/constants/colors";
import React from "react";

export default function ParcoursTimeoutFeedback({
	answerLabel,
	onHide,
	durationMs = 2200,
}: {
	answerLabel: string;
	onHide: () => void;
	durationMs?: number;
}) {
	return (
		<BottomFeedbackSheet
			title='Temps Expiré'
			subtitle={answerLabel}
			backgroundColor={colorWhite}
			textColor={colorBlack}
			onHide={onHide}
			durationMs={durationMs}
			height={248}
			titleSize={40}
			subtitleSize={18}
		/>
	);
}
