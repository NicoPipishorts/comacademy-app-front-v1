import ThumbLikeButton from "@/components/buttons/thumbLike";
import { colorBlack, colorWhite, colorYellow } from "@/constants/colors";
import { FontSize14, FontSizeH1 } from "@/constants/fontsizes";
import { FeedItem } from "@/types/feed";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
}

export default function FeedCardArgh({ data, elementId }: Props) {
	return (
		<View style={{ justifyContent: "flex-start" }}>
			<View style={styles.cardContainer}>
				<Text style={styles.textTitle}>{data.payload.Titre}</Text>
				<Text style={styles.textContent}>{data.payload.Text}</Text>
			</View>
			<ThumbLikeButton elementId={elementId} userLiked={data.userLiked} />
		</View>
	);
}

const styles = StyleSheet.create({
	cardContainer: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: colorBlack,
		marginLeft: 10,
		maxWidth: "84%",
		minHeight: 100,
		paddingVertical: 20,
		paddingHorizontal: 25,
		borderRadius: 20,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		shadowColor: colorBlack,
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	textTitle: {
		alignSelf: "center",
		minWidth: "100%",
		fontSize: FontSizeH1,
		fontWeight: "bold",
		marginBottom: 15,
		color: colorYellow,
		textShadowColor: "rgba(255, 255, 255, 0.5)",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 16,
		textAlign: "center",
	},
	textContent: {
		color: colorWhite,
		fontSize: FontSize14,
	},
});
