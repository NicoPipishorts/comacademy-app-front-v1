// src/components/cards/CardLesCitations.tsx
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSize22 } from "@/constants/fontsizes";
import { CitationData } from "@/types/lesCitations";
import React, { memo } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import CitationHeart from "../buttons/CitationHeart";

type Props = {
	citation: CitationData;
	/** Optional: show a "+" action for this citation (e.g., add to playlist) */
	onAddPress?: (citationId: number) => void;
};

function CardLesCitationsBase({ citation, onAddPress }: Props) {
	return (
		<View key={citation.id} style={styles.cardWrapper}>
			<View style={styles.cardContainer}>
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
			<View style={styles.actionsRow}>
				<CitationHeart
					id={citation.id}
					containerStyle={styles.actionIconButton}
					imageStyle={styles.actionIconImage}
				/>
			</View>
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

	return sameId && sameCitation && sameAuteur && sameOnAddPress;
};

const CardLesCitations = memo(CardLesCitationsBase, propsAreEqual);
export default CardLesCitations;

const styles = StyleSheet.create({
	cardWrapper: {
		marginTop: 60,
		maxHeight: 420,
	},
	cardContainer: {
		flex: 1,
		justifyContent: "center",
		maxWidth: 350,
		minHeight: 250,
		backgroundColor: colorBlack,
		marginHorizontal: 20,
		borderRadius: 20,
		shadowColor: colorBlack,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		shadowOffset: { width: 0, height: 2 },
		elevation: 5,
	},
	openIcon: {
		position: "absolute",
		top: 20,
		left: 20,
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
		padding: 20,
		borderRadius: 10,
	},
	cardTextCitation: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
	},
	containerTextAuteur: {
		width: "100%",
		justifyContent: "flex-start",
		paddingHorizontal: 20,
		paddingBottom: 15,
	},
	cardTextAuteur: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
