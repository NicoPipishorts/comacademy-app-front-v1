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

export default function FeedCardCultureCom({ data, elementId }: Props) {
	const [height, setHeight] = useState<number>(0);
	const [isLoading, setIsLoading] = useState<boolean>(true);

	const aspectRatio = useCallback(() => {
		const { width, height } = data.payload.Media || {};
		const validWidth = width ?? 280;
		const validHeight = height ?? 280;
		if (validWidth <= 0 || validHeight <= 0) {
			console.warn("Invalid width/height values:", { width, height });
			return 1;
		}
		return validWidth / validHeight;
	}, [data.payload.Media]);

	const baseUrl = process.env.EXPO_PUBLIC_URL;
	const imageUrl = data.payload.Media?.url
		? `${baseUrl}${data.payload.Media.url}`
		: null;
	const source = imageUrl ? { uri: imageUrl } : null;

	useEffect(() => {
		try {
			const calculatedHeight = 280 / aspectRatio();
			if (isNaN(calculatedHeight) || calculatedHeight <= 0) {
				throw new Error("Invalid height calculation");
			}
			setHeight(calculatedHeight);
		} catch (error) {
			console.error("Error calculating height:", error);
			setHeight(280);
		} finally {
			setIsLoading(false);
		}
	}, [aspectRatio]);

	if (isLoading) {
		return null;
	}

	return (
		<View style={styles.cardContainer}>
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
