import { FeedItem } from "@/types/feed";
import { Image, StyleSheet, Text, View } from "react-native";

interface Props {
	data: FeedItem;
}

export default function FeedCardFooter({ data }: Props) {
	return (
		<View style={styles.container}>
			<Image
				source={require("@/assets/imgs/logos/square-eyes.png")}
				style={styles.icon}
				resizeMode='contain'
			/>
			<Text style={{ fontWeight: "bold" }}>{data.likes}</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		justifyContent: "flex-start",
		alignItems: "center",
		minWidth: "100%",
		marginTop: 20,
	},
	icon: {
		width: 32,
		height: 32,
		marginLeft: 8,
		marginRight: 20,
	},
});
