import { Image, Pressable, StyleSheet } from "react-native";

export default function ThumbLikeButton() {
	return (
		<Pressable style={{ marginTop: 20 }}>
			<Image
				source={require("@/assets/imgs/icons/thumb.png")}
				style={styles.icon}
				resizeMode='contain'
			/>
		</Pressable>
	);
}
const styles = StyleSheet.create({
	icon: {
		width: 32,
		height: 32,
		marginLeft: 8,
	},
});
