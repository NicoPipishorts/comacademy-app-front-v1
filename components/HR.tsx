import { colorGrey } from "@/constants/colors";
import { StyleSheet, View } from "react-native";

const HR = () => {
	return (
		<View style={styles.container}>
			<View style={styles.line} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		width: "100%",
		justifyContent: "center",
		paddingHorizontal: 30,
	},
	line: {
		height: 1,
		backgroundColor: colorGrey,
		marginVertical: 40,
	},
});

export default HR;
