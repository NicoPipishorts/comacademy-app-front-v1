import { FeedItem } from "@/types/feed";
import { ResizeMode, Video } from "expo-av";
import React from "react";
import { StyleSheet, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
	visibleItems: number[];
}

export default function FeedCardPetitesHistoires({
	data,
	visibleItems,
}: Props) {
	return (
		<View style={styles.container}>
			<Video
				source={{
					uri: `${process.env.EXPO_PUBLIC_URL}${data.payload.Media.url}`,
				}}
				style={{ width: 275, height: 490 }}
				shouldPlay={visibleItems.includes(data.id)}
				isLooping={false}
				useNativeControls={true}
				resizeMode={ResizeMode.STRETCH}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { width: "86%", borderRadius: 10, overflow: "hidden" },
});
