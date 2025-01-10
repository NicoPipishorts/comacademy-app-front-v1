import { colorBlack } from "@/constants/colors";
import { FontSize12, FontSize14, FontSizeH1 } from "@/constants/fontsizes";
import { FeedAttributes } from "@/types/feed";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedAttributes;
}

export default function FeedCardMetier({ data }: Props) {
	function removeUnderscores(input) {
		return input.replace(/_/g, " ");
	}

	return (
		<View style={styles.cardContainer}>
			<Text style={styles.textTitle}>{data.payload.METIER}</Text>
			<Text style={styles.textSubTitle}>
				{removeUnderscores(data.payload.THEME)}
			</Text>
			<Text style={styles.textContent}>{data.payload.CONTENT}</Text>
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
	},
	textSubTitle: {
		color: colorBlack,
		fontSize: FontSize12,
		fontWeight: "bold",
		marginBottom: 15,
	},
	textContent: {
		color: colorBlack,
		fontSize: FontSize14,
		fontWeight: "bold",
	},
});
