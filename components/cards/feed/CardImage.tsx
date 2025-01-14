import { colorBlack, primaryBackground } from "@/constants/colors";
import { FontSize14, FontSizeH1 } from "@/constants/fontsizes";
import { FeedItem } from "@/types/feed";
import { Image, StyleSheet, View } from "react-native";

interface Props {
	data: FeedItem;
	elementId: number;
}

export default function FeedCardImage({ data, elementId }: Props) {
	const aspectRatio = () => {
		return data.payload.Media.width / data.payload.Media.height;
	};

	return (
		<View style={styles.cardContainer}>
			<Image
				source={{
					uri: `${process.env.EXPO_PUBLIC_URL}${data.payload.Media.url}`,
				}}
				resizeMode='contain'
				style={{
					borderWidth: 8,
					borderColor: primaryBackground,
					borderRadius: 25,
					width: 280,
					height: 280 * aspectRatio(),
				}}
			/>
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
