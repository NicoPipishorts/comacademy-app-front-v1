import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

// Secret Card Component
export default function SecretCard({
	title,
	text,
	cardWidth,
	cardMargin,
	index,
}) {
	return (
		<View style={styles.wrapper}>
			<LinearGradient
				colors={["#CA87E9", "#F0ADAE"]}
				style={[
					styles.keyCardWrapper,
					{ width: cardWidth, marginHorizontal: cardMargin },
				]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}>
				<Text style={styles.keyCardTitle}>{title} :</Text>
				<View style={styles.cardContent}>
					<Text style={styles.keyCardText}>{text}</Text>
				</View>
				<View style={styles.cardNumberWrapper}>
					<Text style={styles.keyCardNum}>{index + 1}</Text>
				</View>
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		minHeight: "100%",
		justifyContent: "center",
		alignItems: "center",
	},
	keyCardWrapper: {
		position: "relative",
		justifyContent: "flex-start",
		minHeight: "70%",
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingTop: 40,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
	},
	keyCardTitle: {
		color: colorWhite,
		fontSize: FontSizeH1,
		fontWeight: "bold",
	},
	cardContent: {
		marginTop: 20,
	},
	keyCardText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	cardNumberWrapper: {
		marginTop: 20,
		position: "absolute",
		bottom: 10,
		left: 30,
	},
	keyCardNum: {
		color: colorWhite,
		fontSize: 148,
		opacity: 0.2,
		fontWeight: "bold",
	},
});
