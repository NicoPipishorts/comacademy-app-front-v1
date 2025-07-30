import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSize22 } from "@/constants/fontsizes";
import { CitationData } from "@/types/lesCitations";
import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
	citation: CitationData;
}

export default function CardLesCitations({ citation }: Props) {
	return (
		<View key={citation.id} style={styles.cardWrapper}>
			<View
				style={{
					paddingRight: 50,
					paddingBottom: 5,
					alignItems: "flex-end",
				}}>
				{/* <Text style={{ fontSize: FontSize14, fontWeight: "bold" }}>
					{moment(citation.attributes.updatedAt).format("DD/MM/YYYY")}
				</Text> */}
			</View>
			<View style={styles.cardContainer}>
				<Image
					source={require("@/assets/imgs/icons/quote_close.png")}
					style={{
						position: "absolute",
						bottom: 20,
						right: 20,
						width: 45,
						height: 45,
					}}
				/>
				<Image
					source={require("@/assets/imgs/icons/quote_open.png")}
					style={{
						position: "absolute",
						top: 20,
						left: 20,
						width: 45,
						height: 45,
					}}
				/>
				<View style={styles.cardContent}>
					<Text style={styles.cardTextCitation}>
						{citation.attributes.CITATION}
					</Text>
				</View>
				<View style={styles.containerTextAuteur}>
					<Text style={styles.cardTextAuteur}>
						{citation.attributes.AUTEUR}
					</Text>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	cardWrapper: {
		maxHeight: 420,
	},
	cardContainer: {
		flex: 1,
		justifyContent: "center",
		maxWidth: 350,
		minHeight: 250,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		elevation: 5,
		backgroundColor: colorBlack,
		marginHorizontal: 20,
		borderRadius: 20,
		shadowColor: colorBlack,
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	cardContent: {
		padding: 20,
		borderRadius: 10,
	},
	cardTextCitation: {
		color: colorWhite,
		fontSize: FontSize22,
		fontWeight: "bold",
	},
	containerTextAuteur: {
		width: "100%",
		justifyContent: "flex-start",
		paddingHorizontal: 20,
		paddingBottom: 15,
	},
	cardTextAuteur: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
