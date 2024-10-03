import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { StyleSheet, Text, View } from "react-native";

export default function CommandementTitleCard({ cardWidth, theme }) {
	return (
		<View style={[styles.titleCardWrapper, { width: cardWidth }]}>
			<Text style={styles.titleCardText}>{theme}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	titleCardWrapper: {
		justifyContent: "center",
		alignItems: "center",
		minHeight: "80%",
		backgroundColor: colorBlack,
		paddingHorizontal: 24,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
		marginHorizontal: 13,
	},
	titleCardText: {
		color: colorWhite,
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		lineHeight: 44,
	},
});
