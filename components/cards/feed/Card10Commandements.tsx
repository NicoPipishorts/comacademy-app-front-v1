import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize14, FontSizeH1 } from "@/constants/fontsizes";
import { FeedAttributes } from "@/types/feed";
import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedAttributes;
}

export default function FeedCard10Commandements({ data }: Props) {
	const [title, text] = data.payload.Astuce.split(/\r?\n/, 2); // Split at the first line break
	return (
		<View style={styles.cardContainer}>
			<Text style={styles.cardTitle}>{data.payload.Theme} :</Text>
			<LinearGradient
				colors={["#368FC9", "#79FC7E"]}
				style={[styles.keyCardWrapper]}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}>
				<View>
					<Text style={styles.keyCardTitle}>{title}</Text>
					<Text style={styles.keyCardText}>{text}</Text>
				</View>
				<View style={styles.cardNumberWrapper}>
					<Text style={styles.keyCardNum}>{data.payload.index}</Text>
				</View>
			</LinearGradient>
		</View>
	);
}

const styles = StyleSheet.create({
	cardContainer: {
		marginLeft: 10,
		width: "84%",
		minHeight: 100,
		shadowOpacity: 0.35,
		shadowRadius: 15,
		shadowColor: colorBlack,
		shadowOffset: {
			width: 0,
			height: 2,
		},
	},
	keyCardWrapper: {
		position: "relative",
		justifyContent: "flex-start",
		backgroundColor: colorBlack,
		paddingVertical: 35,
		paddingHorizontal: 25,
		paddingBottom: 100,
		borderRadius: 25,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.55,
		shadowRadius: 10.84,
	},
	cardTitle: {
		fontSize: FontSize14,
		color: colorBlack,
		fontWeight: "bold",
		marginLeft: 10,
		marginBottom: 10,
	},
	keyCardTitle: {
		color: colorWhite,
		fontSize: FontSizeH1,
		fontWeight: "bold",
		marginBottom: 15,
	},
	keyCardText: {
		color: colorWhite,
		fontSize: FontSize14,
		fontWeight: "bold",
	},
	cardNumberWrapper: {
		marginTop: 20,
		position: "absolute",
		bottom: 0,
		left: 30,
	},
	keyCardNum: {
		color: colorWhite,
		fontSize: 148,
		opacity: 0.2,
		fontWeight: "bold",
	},
});
