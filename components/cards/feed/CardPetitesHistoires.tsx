import { colorBlack } from "@/constants/colors";
import { FontSize14, FontSizeH1 } from "@/constants/fontsizes";
import { FeedItem } from "@/types/feed";
import { ResizeMode, Video } from "expo-av";
import { StyleSheet, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
}

export default function FeedCardPetitesHistoires({ data, elementId }: Props) {
	return (
		<View style={styles.container}>
			<Video
				source={{
					uri: `${process.env.EXPO_PUBLIC_URL}${data.payload.Media.url}`,
				}} // Use the URI from the data
				style={{ width: 268, height: 476 }}
				shouldPlay
				isLooping={false} // Disable looping
				useNativeControls={true}
				resizeMode={ResizeMode.STRETCH}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		marginLeft: 10,
		width: "84%",
		minHeight: 100,
		borderRadius: 25,
		overflow: "hidden",
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
