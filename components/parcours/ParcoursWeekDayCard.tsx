import React from "react";
import {
	Pressable,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	View,
	ViewStyle,
} from "react-native";

import {
	colorBlack,
	colorDarkGrey,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import {
	FontSize12,
	FontSize14,
	FontSize18,
} from "@/constants/fontsizes";
import { resolveParcoursAccentColor } from "@/helpers/parcours/theme";
import { getParcoursDayLabel } from "@/helpers/parcours/week";
import { ParcoursTimelineDay } from "@/types/parcours";

type DayCardPresentation = {
	containerStyle: StyleProp<ViewStyle>;
	titleStyle: StyleProp<TextStyle>;
	subtitleStyle: StyleProp<TextStyle>;
	label: string | null;
	labelStyle: StyleProp<ViewStyle> | null;
	labelTextStyle: StyleProp<TextStyle> | null;
	buttonStyle: StyleProp<ViewStyle> | null;
	buttonTextStyle: StyleProp<TextStyle> | null;
	isAction: boolean;
};

const getDayCardPresentation = (
	day: ParcoursTimelineDay,
	isCurrentReadyDay: boolean
): DayCardPresentation => {
	const themeColor = resolveParcoursAccentColor(
		day.accentColor,
		day.category?.color
	);

	if (day.isLocked) {
		return {
			containerStyle: styles.dayCardLocked,
			titleStyle: styles.dayTitleLocked,
			subtitleStyle: styles.daySubtitleLocked,
			label: null,
			labelStyle: null,
			labelTextStyle: null,
			buttonStyle: null,
			buttonTextStyle: null,
			isAction: false,
		};
	}

	if (day.status === "completed") {
		return {
			containerStyle: styles.dayCardDefault,
			titleStyle: styles.dayTitle,
			subtitleStyle: styles.daySubtitle,
			label: "Complet",
			labelStyle: styles.metaPillSuccess,
			labelTextStyle: styles.metaPillSuccessText,
			buttonStyle: null,
			buttonTextStyle: null,
			isAction: false,
		};
	}

	if (day.status === "in_progress") {
		return {
			containerStyle: [
				styles.dayCardDefault,
				styles.dayCardReady,
				{ borderColor: themeColor },
			],
			titleStyle: styles.dayTitle,
			subtitleStyle: styles.daySubtitle,
			label: "Incomplet",
			labelStyle: [styles.metaPillAccent, { backgroundColor: `${themeColor}1A` }],
			labelTextStyle: [styles.metaPillAccentText, { color: themeColor }],
			buttonStyle: null,
			buttonTextStyle: null,
			isAction: false,
		};
	}

	if (day.status === "ready") {
		return {
			containerStyle: isCurrentReadyDay
				? [styles.dayCardDefault, styles.dayCardReady, { borderColor: themeColor }]
				: styles.dayCardDefault,
			titleStyle: styles.dayTitle,
			subtitleStyle: styles.daySubtitle,
			label: isCurrentReadyDay ? "Go" : "Disponible",
			labelStyle: isCurrentReadyDay ? null : styles.metaPillMuted,
			labelTextStyle: isCurrentReadyDay ? null : styles.metaPillMutedText,
			buttonStyle: isCurrentReadyDay
				? [styles.actionButton, { backgroundColor: themeColor }]
				: null,
			buttonTextStyle: styles.actionButtonText,
			isAction: isCurrentReadyDay,
		};
	}

	return {
		containerStyle: styles.dayCardDefault,
		titleStyle: styles.dayTitle,
		subtitleStyle: styles.daySubtitle,
		label: "Lecture seule",
		labelStyle: styles.metaPillMuted,
		labelTextStyle: styles.metaPillMutedText,
		buttonStyle: null,
		buttonTextStyle: null,
		isAction: false,
	};
};

export default function ParcoursWeekDayCard({
	day,
	isCurrentReadyDay,
	onPress,
}: {
	day: ParcoursTimelineDay;
	isCurrentReadyDay: boolean;
	onPress: () => void;
}) {
	const card = getDayCardPresentation(day, isCurrentReadyDay);

	return (
		<Pressable
			disabled={!day.isAccessible}
			onPress={onPress}
			style={[styles.dayCard, card.containerStyle]}>
			<View style={styles.dayTextColumn}>
				<Text style={[styles.dayLabel, card.titleStyle]}>
					{getParcoursDayLabel(day.dayKey)}
				</Text>
				<Text
					numberOfLines={1}
					ellipsizeMode='tail'
					style={[styles.dayHeadline, card.subtitleStyle]}>
					{day.themeTitle || "Challenge du jour"}
				</Text>
			</View>
			{card.label ? (
				card.isAction ? (
					<View style={card.buttonStyle}>
						<Text style={card.buttonTextStyle}>{card.label}</Text>
					</View>
				) : (
					<View style={card.labelStyle}>
						<Text style={[styles.metaPillText, card.labelTextStyle]}>
							{card.label}
						</Text>
					</View>
				)
			) : null}
		</Pressable>
	);
}

const styles = StyleSheet.create({
	dayCard: {
		borderRadius: 22,
		paddingHorizontal: 14,
		paddingVertical: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 16 },
		shadowOpacity: 0.16,
		shadowRadius: 28,
		elevation: 6,
	},
	dayCardDefault: {
		backgroundColor: colorWhite,
	},
	dayCardReady: {
		borderWidth: 4,
	},
	dayCardLocked: {
		backgroundColor: "#E4E4E4",
		shadowOpacity: 0,
		elevation: 0,
	},
	dayTextColumn: {
		flex: 1,
		paddingRight: 12,
	},
	dayLabel: {
		fontSize: FontSize12,
		fontWeight: "800",
		marginBottom: 6,
	},
	dayHeadline: {
		fontSize: FontSize18,
		fontWeight: "800",
		lineHeight: 20,
	},
	dayTitle: {
		color: colorBlack,
	},
	daySubtitle: {
		color: colorBlack,
	},
	dayTitleLocked: {
		color: colorWhite,
		opacity: 0.85,
	},
	daySubtitleLocked: {
		color: colorWhite,
		opacity: 0.92,
	},
	metaPillSuccess: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#D6FFD9",
	},
	metaPillSuccessText: {
		color: "#2FB35A",
	},
	metaPillAccent: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
	},
	metaPillAccentText: {
		fontSize: FontSize12,
		fontWeight: "800",
	},
	metaPillMuted: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#ECECEC",
	},
	metaPillMutedText: {
		color: colorDarkGrey,
	},
	metaPillText: {
		fontSize: FontSize12,
		fontWeight: "800",
		color: colorBlack,
	},
	actionButton: {
		paddingHorizontal: 18,
		paddingVertical: 14,
		borderRadius: 999,
		backgroundColor: colorPink,
		alignItems: "center",
		justifyContent: "center",
	},
	actionButtonText: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorWhite,
	},
});
