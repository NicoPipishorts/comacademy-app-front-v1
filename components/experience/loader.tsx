import { colorYellow } from "@/constants/colors";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export default function Loader() {
	return (
		<View style={styles.loadingContainer}>
			<ActivityIndicator size='large' color={colorYellow} />
		</View>
	);
}

const styles = StyleSheet.create({
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(250, 250, 250, 0.75)", // 75% opacity for black background
	},
});
