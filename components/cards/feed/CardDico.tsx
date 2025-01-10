import { colorBlack } from "@/constants/colors";
import { FontSize14, FontSizeH1 } from "@/constants/fontsizes";
import { FeedAttributes } from "@/types/feed";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedAttributes;
}

export default function FeedCardDico({ data }: Props) {
	return (
		<View style={styles.cardContainer}>
			<Text style={styles.textTitle}>{data.payload.Word}</Text>
			<Text style={styles.textContent}>{data.payload.Definition}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	cardContainer: {
		marginLeft: 10,
		width: "80%",
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
