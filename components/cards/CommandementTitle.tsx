import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSizeScreenTitles } from "@/constants/fontsizes";
import { StyleSheet, Text, View } from "react-native";

export default function CommandementTitleCard({
	cardWidth,
	cardMargin,
	theme,
	screenWidth,
}) {
	return (
		<View style={[styles.wrapper, { width: screenWidth }]}>
			<View
				style={[
					styles.titleCardWrapper,
					{ width: cardWidth, marginHorizontal: cardMargin },
				]}>
				<Text style={styles.titleCardText}>{theme}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		flexGrow: 1,
		minHeight: "100%",
		justifyContent: "center",
		alignItems: "center",
		paddingLeft: 20,
		marginRight: -20,
	},
	titleCardWrapper: {
		justifyContent: "center",
		alignItems: "center",
		minHeight: "70%",
		backgroundColor: colorBlack,
		paddingHorizontal: 24,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
	},
	titleCardText: {
		color: colorWhite,
		fontSize: FontSizeScreenTitles,
		fontWeight: "bold",
		lineHeight: 44,
	},
});
