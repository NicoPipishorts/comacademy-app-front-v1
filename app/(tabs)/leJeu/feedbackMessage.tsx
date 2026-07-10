import { colorGreen, colorPink } from "@/constants/colors";
import BottomFeedbackSheet from "@/components/experience/BottomFeedbackSheet";
import { Answer } from "@/types/enums";
import React from "react";

interface FeedbackMessageProps {
	answer: Answer;
	onHide: () => void;
	isHomeButtonModel: boolean;
	durationMs?: number;
}

export default function FeedbackMessage({
	answer,
	onHide,
	isHomeButtonModel,
	durationMs = 500,
}: FeedbackMessageProps) {
	const getBackgroundColor = () => {
		switch (answer) {
			case Answer.true:
				return colorGreen;
			case Answer.false:
				return colorPink;
			default:
				return colorPink; // fallback
		}
	};

	return (
		<BottomFeedbackSheet
			title={answer}
			backgroundColor={getBackgroundColor()}
			onHide={onHide}
			durationMs={durationMs}
			height={isHomeButtonModel ? 236 : 336}
			titleSize={100}
		/>
	);
}
