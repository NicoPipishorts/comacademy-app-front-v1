// src/components/cards/CardLesCitations.tsx
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSize22 } from "@/constants/fontsizes";
import { CitationData } from "@/types/lesCitations";
import React, { memo } from "react";
import { Image, StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import CitationHeart from "../buttons/CitationHeart";

type Props = {
	citation: CitationData;
	/** Optional: show a "+" action for this citation (e.g., add to playlist) */
	onAddPress?: (citationId: number) => void;
	showFavorite?: boolean;
	wrapperStyle?: StyleProp<ViewStyle>;
	cardStyle?: StyleProp<ViewStyle>;
	actionsRowStyle?: StyleProp<ViewStyle>;
};

function CardLesCitationsBase({
	citation,
	onAddPress,
	showFavorite = true,
	wrapperStyle,
	cardStyle,
	actionsRowStyle,
}: Props) {
	return (
		<View key={citation.id} style={[styles.cardWrapper, wrapperStyle]}>
			<View style={[styles.cardContainer, cardStyle]}>
				{/* Decorative quotes */}
				<Image
					source={require("@/assets/imgs/icons/quote_close.png")}
					style={styles.closeIcon}
				/>
				<Image
					source={require("@/assets/imgs/icons/quote_open.png")}
					style={styles.openIcon}
				/>

				{/* Content */}
				<View style={styles.cardContent}>
					<Text style={styles.cardTextCitation}>
						{citation.attributes.CITATION}
					</Text>
				</View>
				<View style={styles.containerTextAuteur}>
					<Text style={styles.cardTextAuteur}>
						{citation.attributes.AUTEUR}
					</Text>
				</View>
			</View>

			{/* Action row (top-right): Plus (optional) + Heart */}
			{showFavorite ? (
				<View style={[styles.actionsRow, actionsRowStyle]}>
					<CitationHeart
						id={citation.id}
						containerStyle={styles.actionIconButton}
						imageStyle={styles.actionIconImage}
					/>
				</View>
			) : null}
		</View>
	);
}

const propsAreEqual = (prev: Props, next: Props) => {
	// Re-render only if relevant bits change
	const p = prev.citation;
	const n = next.citation;

	const sameId = p.id === n.id;
	const sameCitation = p.attributes?.CITATION === n.attributes?.CITATION;
	const sameAuteur = p.attributes?.AUTEUR === n.attributes?.AUTEUR;

	// If your API updates other visible fields, add them here as well.

	const sameOnAddPress = prev.onAddPress === next.onAddPress;
	const sameShowFavorite = prev.showFavorite === next.showFavorite;
	const sameWrapperStyle = prev.wrapperStyle === next.wrapperStyle;
	const sameCardStyle = prev.cardStyle === next.cardStyle;
	const sameActionsRowStyle = prev.actionsRowStyle === next.actionsRowStyle;

	return (
		sameId &&
		sameCitation &&
		sameAuteur &&
		sameOnAddPress &&
		sameShowFavorite &&
		sameWrapperStyle &&
		sameCardStyle &&
		sameActionsRowStyle
	);
};

const CardLesCitations = memo(CardLesCitationsBase, propsAreEqual);
export default CardLesCitations;

const styles = StyleSheet.create({
	cardWrapper: {
		marginTop: 24,
		width: "100%",
	},
	cardContainer: {
		width: "100%",
		minHeight: 290,
		backgroundColor: colorBlack,
		borderRadius: 20,
		shadowColor: colorBlack,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		shadowOffset: { width: 0, height: 2 },
		elevation: 5,
	},
	openIcon: {
		position: "absolute",
		top: 16,
		left: 16,
		width: 45,
		height: 45,
	},
	closeIcon: {
		position: "absolute",
		bottom: 20,
		right: 20,
		width: 45,
		height: 45,
	},
	actionsRow: {
		marginTop: 10,
		width: "90%",
		alignItems: "flex-end",
	},
	actionIconButton: {
		width: 28,
		height: 28,
		justifyContent: "center",
		alignItems: "center",
	},
	actionIconImage: {
		width: 28,
		height: 28,
	},
	cardContent: {
		paddingTop: 72,
		paddingHorizontal: 24,
		paddingBottom: 12,
		borderRadius: 10,
		flexShrink: 1,
	},
	cardTextCitation: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
		lineHeight: 30,
	},
	containerTextAuteur: {
		width: "100%",
		justifyContent: "flex-start",
		paddingHorizontal: 24,
		paddingRight: 72,
		paddingBottom: 28,
		marginTop: 8,
	},
	cardTextAuteur: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
		lineHeight: 22,
	},
});
