import {
	colorBlue,
	colorGreen,
	colorOrange,
	colorPurple,
	colorTurquoise,
	colorYellow,
} from "@/constants/colors";
import { Image, StyleSheet, View } from "react-native";

export default function LogoPageTop() {
	return (
		<View>
			<Image
				source={require("@/assets/imgs/logos/Login.png")}
				style={styles.logo}
				resizeMode='contain'
			/>
			<View style={styles.containerDots}>
				<View style={[styles.dot, { backgroundColor: colorPurple }]} />
				<View style={[styles.dot, { backgroundColor: colorOrange }]} />
				<View style={[styles.dot, { backgroundColor: colorYellow }]} />
				<View style={[styles.dot, { backgroundColor: colorGreen }]} />
				<View style={[styles.dot, { backgroundColor: colorTurquoise }]} />
				<View style={[styles.dot, { backgroundColor: colorBlue }]} />
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	logo: {
		width: 150,
		height: 60,
	},
	containerDots: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
	},
	dot: {
		width: 10,
		height: 10,
		marginHorizontal: 8,
		borderRadius: 50,
	},
});
