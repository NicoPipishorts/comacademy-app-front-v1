import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import {
	colorBlack,
	colorDarkGrey,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BonusScreen() {
	const insets = useSafeAreaInsets();

	useTrackPageMetrics({ page: "Bonus" });

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='Bonus'
				containerStyle={styles.headerContainer}
			/>
			<View
				style={[
					styles.centeredContent,
					{ paddingBottom: insets.bottom + 72 },
				]}>
				<View style={styles.teaserFrame}>
					<View style={[styles.cornerStroke, styles.cornerTopLeft]} />
					<View style={[styles.cornerStroke, styles.cornerTopRight]} />
					<View style={[styles.cornerStroke, styles.cornerBottomLeft]} />
					<View style={[styles.cornerStroke, styles.cornerBottomRight]} />

					<Text style={styles.kicker}>NOUVEAU CONTENU</Text>
					<Text style={styles.comingSoonTitle}>Coming soon</Text>
					<Text style={styles.description}>
						La section bonus est en preparation et arrive tres bientot.
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	headerContainer: {
		paddingHorizontal: 24,
	},
	centeredContent: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 24,
	},
	teaserFrame: {
		width: "100%",
		maxWidth: 360,
		minHeight: 260,
		paddingHorizontal: 30,
		paddingVertical: 36,
		borderRadius: 24,
		backgroundColor: primaryBackground,
		justifyContent: "center",
		alignItems: "center",
		position: "relative",
	},
	cornerStroke: {
		position: "absolute",
		width: 26,
		height: 26,
		borderColor: "rgba(39,39,39,0.28)",
	},
	cornerTopLeft: {
		top: 14,
		left: 14,
		borderTopWidth: 1.5,
		borderLeftWidth: 1.5,
		borderTopLeftRadius: 10,
	},
	cornerTopRight: {
		top: 14,
		right: 14,
		borderTopWidth: 1.5,
		borderRightWidth: 1.5,
		borderTopRightRadius: 10,
	},
	cornerBottomLeft: {
		bottom: 14,
		left: 14,
		borderBottomWidth: 1.5,
		borderLeftWidth: 1.5,
		borderBottomLeftRadius: 10,
	},
	cornerBottomRight: {
		bottom: 14,
		right: 14,
		borderBottomWidth: 1.5,
		borderRightWidth: 1.5,
		borderBottomRightRadius: 10,
	},
	kicker: {
		fontSize: FontSize14,
		fontWeight: "700",
		color: colorDarkGrey,
		letterSpacing: 0.8,
		marginBottom: 14,
	},
	comingSoonTitle: {
		fontSize: FontSizeH1,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 10,
		textAlign: "center",
	},
	description: {
		fontSize: FontSize16,
		fontWeight: "500",
		color: colorDarkGrey,
		textAlign: "center",
		lineHeight: 23,
		maxWidth: 260,
	},
});
