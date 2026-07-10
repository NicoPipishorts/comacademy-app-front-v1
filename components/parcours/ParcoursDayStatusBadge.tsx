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
	iconName: keyof typeof MaterialCommunityIcons.glyphMap;
	label: string;
};

const STATUS_TONES: Record<ParcoursDayStatus, BadgeTone> = {
	completed: {
		backgroundColor: "#2FB35A",
		iconColor: colorWhite,
		iconName: "check",
		label: "Termine",
	},
	in_progress: {
		backgroundColor: "#F29C38",
		iconColor: colorWhite,
		iconName: "minus",
		label: "Continuer",
	},
	ready: {
		backgroundColor: "#F29C38",
		iconColor: colorWhite,
		iconName: "minus",
		label: "Jouer",
	},
	expired: {
		backgroundColor: "#D84C43",
		iconColor: colorWhite,
		iconName: "close",
		label: "Lecture seule",
	},
	locked: {
		backgroundColor: "#D9DDE5",
		iconColor: "#8E95A3",
		iconName: "circle-medium",
		label: "Verrouille",
	},
};

export const getParcoursDayStatusMeta = (status: ParcoursDayStatus): BadgeTone =>
	STATUS_TONES[status];

export function ParcoursDayStatusBadge({
	status,
	size = 22,
}: {
	status: ParcoursDayStatus;
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
			<MaterialCommunityIcons
				name={tone.iconName}
				size={iconSize}
				color={tone.iconColor}
			/>
		</View>
	);
}

export function ParcoursDayStatusPill({
	status,
}: {
	status: ParcoursDayStatus;
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
