import ThumbLikeButton from "@/components/buttons/thumbLike";
import { colorBlack, colorWhite, colorYellow } from "@/constants/colors";
import { FontSize14 } from "@/constants/fontsizes";
import { FeedItem } from "@/types/feed";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
}

export default function FeedCardNumber({ data, elementId }: Props) {
	return (
		<View style={{ justifyContent: "flex-start" }}>
			<View style={styles.cardContainer}>
				<Text
					style={styles.textTitle}
					numberOfLines={1}
					adjustsFontSizeToFit
					minimumFontScale={0.5}
					ellipsizeMode='tail'>
					{data.payload.Titre}
				</Text>
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
		width: "84%",
		minHeight: 100,
		paddingVertical: 20,
		paddingHorizontal: 25,
		borderRadius: 20,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
	},
	textTitle: {
		width: "100%", // constrain to card width
		fontSize: 78, // starting size
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
