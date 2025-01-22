import { FeedItem } from "@/types/feed";
import { ResizeMode, Video } from "expo-av";
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
				}} // Use the URI from the data
				style={{ width: 268, height: 268 }}
				shouldPlay={visibleItems.includes(data.id)}
				isLooping={false} // Disable looping
				useNativeControls={true}
				resizeMode={ResizeMode.CONTAIN}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { width: "86%", borderRadius: 10, overflow: "hidden" },
});
