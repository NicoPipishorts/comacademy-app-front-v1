import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize12, FontSize16 } from "@/constants/fontsizes";
import { FeedAttributes } from "@/types/feed";
import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedAttributes;
}

export default function FeedCardCitations({ data }: Props) {
	return (
		<View style={styles.cardContainer}>
			<Image
				source={require("@/assets/imgs/icons/quote_open.png")}
				style={{
					width: 45,
					height: 45,
				}}
			/>
			<Text style={styles.textMain}>{data.payload.CITATION}</Text>
			<View style={styles.baseQuoteContainer}>
				<Text style={styles.textAuthor}>{data.payload.AUTEUR}</Text>
				<Image
					source={require("@/assets/imgs/icons/quote_close.png")}
					style={{
						width: 45,
						height: 45,
					}}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	cardContainer: {
		backgroundColor: colorBlack,
		marginLeft: 10,
		width: "84%",
		minHeight: 100,
		paddingVertical: 15,
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
	textMain: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
		marginVertical: 6,
		marginHorizontal: 10,
	},
	baseQuoteContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	textAuthor: {
		color: colorWhite,
		fontSize: FontSize12,
		fontWeight: "bold",
		marginHorizontal: 10,
	},
});
