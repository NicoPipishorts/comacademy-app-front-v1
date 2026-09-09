import { MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

import {
	colorBlack,
	colorDarkGrey,
	colorWhite,
} from "@/constants/colors";
import { FontSize12 } from "@/constants/fontsizes";
import { ParcoursDayStatus } from "@/types/parcours";

type BadgeTone = {
	backgroundColor: string;
	iconColor: string;
	// null = a plain filled circle with no glyph (the customer's "expired" red).
	iconName: keyof typeof MaterialCommunityIcons.glyphMap | null;
	label: string;
};

// Palette supplied by the customer on 2026-09-03. `ready` (unlocked, not
// started) and `in_progress` share the light green "active" look, since the
// customer asked for available days to read as green and gave no separate
// visual for the untouched case.
//
// The past-week states are split in two, because they mean different things to
// the reader: a day left unfinished when the Sunday cut-off froze it reads
// orange (you were there, you can still review it), while a day never opened at
// all keeps the customer's solid red.
const TONE_LOCKED_BG = "#E4E4E4";
const TONE_LOCKED_ICON = "#5C5C5C";
const TONE_ACTIVE_BG = "#D6EDD9";
const TONE_ACTIVE_ICON = "#5CB870";
const TONE_DONE_BG = "#0A6B2A";
const TONE_EXPIRED_BG = "#F63E3E";
const TONE_UNFINISHED_BG = "#FBE3C7";
const TONE_UNFINISHED_ICON = "#E3801B";

/**
 * The badge draws one more state than the server sends: `unfinished` is an
 * `expired` day the user had already started. See `getParcoursDayVisualState`.
 */
export type ParcoursDayVisualState = ParcoursDayStatus | "unfinished";

const STATUS_TONES: Record<ParcoursDayVisualState, BadgeTone> = {
	completed: {
		backgroundColor: TONE_DONE_BG,
		iconColor: colorWhite,
		iconName: "check",
		label: "Termine",
	},
	in_progress: {
		backgroundColor: TONE_ACTIVE_BG,
		iconColor: TONE_ACTIVE_ICON,
		iconName: "dots-horizontal",
		label: "Continuer",
	},
	ready: {
		backgroundColor: TONE_ACTIVE_BG,
		iconColor: TONE_ACTIVE_ICON,
		iconName: "dots-horizontal",
		label: "Jouer",
	},
	unfinished: {
		backgroundColor: TONE_UNFINISHED_BG,
		iconColor: TONE_UNFINISHED_ICON,
		iconName: "circle-medium",
		label: "Lecture seule",
	},
	expired: {
		backgroundColor: TONE_EXPIRED_BG,
		iconColor: colorWhite,
		iconName: null,
		label: "Lecture seule",
	},
	locked: {
		backgroundColor: TONE_LOCKED_BG,
		iconColor: TONE_LOCKED_ICON,
		iconName: "circle-medium",
		label: "Verrouille",
	},
};

export const getParcoursDayStatusMeta = (
	status: ParcoursDayVisualState
): BadgeTone => STATUS_TONES[status];

export function ParcoursDayStatusBadge({
	status,
	size = 22,
}: {
	status: ParcoursDayVisualState;
	size?: number;
}) {
	const tone = getParcoursDayStatusMeta(status);
	const iconSize = Math.max(12, Math.round(size * 0.7));

	return (
		<View
			style={[
				styles.badge,
				{
					width: size,
					height: size,
					borderRadius: size / 2,
					backgroundColor: tone.backgroundColor,
				},
			]}>
			{tone.iconName ? (
				<MaterialCommunityIcons
					name={tone.iconName}
					size={iconSize}
					color={tone.iconColor}
				/>
			) : null}
		</View>
	);
}

export function ParcoursDayStatusPill({
	status,
}: {
	status: ParcoursDayVisualState;
}) {
	const tone = getParcoursDayStatusMeta(status);

	return (
		<View style={[styles.pill, { backgroundColor: `${tone.backgroundColor}1F` }]}>
			<ParcoursDayStatusBadge status={status} size={20} />
			<Text
				style={[
					styles.pillLabel,
					{ color: status === "locked" ? colorDarkGrey : colorBlack },
				]}>
				{tone.label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	badge: {
		alignItems: "center",
		justifyContent: "center",
	},
	pill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 10,
		paddingVertical: 8,
		borderRadius: 999,
	},
	pillLabel: {
		fontSize: FontSize12,
		fontWeight: "800",
	},
});
