import ThumbLikeButton from "@/components/buttons/thumbLike";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize20 } from "@/constants/fontsizes";
import { FeedItem } from "@/types/feed";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
}

export default function FeedCardVie({ data, elementId }: Props) {
	return (
		<View style={{ justifyContent: "flex-start" }}>
			<View style={styles.cardContainer}>
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
		paddingVertical: 30,
		paddingHorizontal: 30,
		borderRadius: 20,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		shadowColor: colorBlack,
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	textContent: {
		color: colorWhite,
		fontSize: FontSize20,
		fontWeight: "bold",
	},
});
