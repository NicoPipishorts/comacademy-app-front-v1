import { FeedAttributes } from "@/types/feed";
import { Image, StyleSheet, View } from "react-native";

interface Props {
	data: FeedAttributes;
}

export default function FeedCardFooter({ data }: Props) {
	return (
		<View>
			<View style={styles.container}>
				<Image
					source={require("@/assets/imgs/logos/square-eyes.png")}
					style={styles.icon}
					resizeMode='contain'
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "flex-start",
		minWidth: "100%",
		marginTop: 20,
	},
	icon: {
		width: 32,
		height: 32,
		marginLeft: 8,
	},
});
