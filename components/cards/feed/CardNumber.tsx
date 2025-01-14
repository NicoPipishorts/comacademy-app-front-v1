import ThumbLikeButton from "@/components/buttons/thumbLike";
import {
	colorBlack,
	colorOrange,
	colorPink,
	colorPurple,
	colorTurquoise,
	colorWhite,
	colorYellow,
} from "@/constants/colors";
import { FontSize14 } from "@/constants/fontsizes";
import { FeedItem } from "@/types/feed";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
}

export default function FeedCardNumber({ data, elementId }: Props) {
	const [titleColor, setTitleColor] = useState(colorWhite); // Default to white

	// Define the available colors
	const colors = [
		colorYellow,
		colorPink,
		colorTurquoise,
		colorPurple,
		colorOrange,
	];

	// Function to randomly set a new color
	const setRandomColor = () => {
		const randomIndex = Math.floor(Math.random() * colors.length);
		setTitleColor(colors[randomIndex]);
	};

	// Set a random color when the component mounts
	useEffect(() => {
		setRandomColor();
	}, []);

	return (
		<View style={{ justifyContent: "flex-start" }}>
			<View style={styles.cardContainer}>
				<Text style={[styles.textTitle, { color: titleColor }]}>
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
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	textTitle: {
		fontSize: 78,
		fontWeight: "bold",
		marginBottom: 15,
	},
	textContent: {
		color: colorWhite,
		fontSize: FontSize14,
	},
});
