import ThumbLikeButton from "@/components/buttons/thumbLike";
import { colorBlack, primaryBackground } from "@/constants/colors";
import { FontSize14, FontSize18, FontSizeH1 } from "@/constants/fontsizes";
import { FeedItem } from "@/types/feed";
import React, { useCallback, useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
}

export default function FeedCardCardComAcademy({ data, elementId }: Props) {
	const [height, setHeight] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	// Function to calculate aspect ratio with a fallback
	const aspectRatio = useCallback(() => {
		const { width, height } = data.payload.Media || {};
		// Fallback values if width or height is missing
		const validWidth = width ?? 280; // Default width
		const validHeight = height ?? 280; // Default height (square image)
		if (validWidth <= 0 || validHeight <= 0) {
			console.warn("Invalid width/height values:", { width, height });
			return 1; // Default aspect ratio (square)
		}
		return validWidth / validHeight;
	}, [data.payload.Media]);

	// Build the image URL and ensure it has a fallback
	const baseUrl = process.env.EXPO_PUBLIC_URL;
	const imageUrl = data.payload.Media?.url
		? `${baseUrl}${data.payload.Media.url}`
		: null;
	const source = imageUrl ? { uri: imageUrl } : null;

	useEffect(() => {
		try {
			const calculatedHeight = 280 / aspectRatio();
			// Validate the calculated height
			if (isNaN(calculatedHeight) || calculatedHeight <= 0) {
				throw new Error("Invalid height calculation");
			}
			setHeight(calculatedHeight);
		} catch (error) {
			console.error("Error calculating height:", error);
			setHeight(280); // Default height
		} finally {
			setIsLoading(false);
		}
	}, [aspectRatio]);

	if (isLoading) {
		return null;
	}

	return (
		<View style={styles.cardContainer}>
			{/* Render the image only if the source is valid */}
			<>
				<Text
					style={{
						fontWeight: "bold",
						fontSize: FontSize18,
						marginHorizontal: 15,
						marginBottom: 20,
					}}>
					{data.payload.Titre}
				</Text>
				<Text
					style={{
						fontWeight: "bold",
						marginHorizontal: 15,
						marginBottom: 10,
					}}>
					{data.payload.Text}
				</Text>
				{data.payload.Media && (
					<Image
						source={source}
						style={{
							borderWidth: 8,
							borderColor: primaryBackground,
							borderRadius: 25,
							width: 280,
							height: height,
						}}
					/>
				)}

				{data.payload.Credits && (
					<Text
						style={{
							fontWeight: "bold",
							marginHorizontal: 15,
							marginTop: 10,
						}}>
						Crédit photo :{data.payload.Credits}
					</Text>
				)}
			</>
			{/* Render the like button */}
			<ThumbLikeButton elementId={elementId} userLiked={data.userLiked} />
		</View>
	);
}

const styles = StyleSheet.create({
	cardContainer: {
		marginLeft: 10,
		width: "84%",
		minHeight: 100,
	},
	textTitle: {
		color: colorBlack,
		fontSize: FontSizeH1,
		fontWeight: "bold",
		marginBottom: 15,
	},
	textContent: {
		color: colorBlack,
		fontSize: FontSize14,
		fontWeight: "bold",
	},
});
