import FavoritePlaylist from "@/assets/imgs/icons/FavoritePlaylist.png";
import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	title: string;
	type: "favorites" | "personal";
	destination: "favorites" | number;
}

export default function CardFavoritesList({ title, type }: Props) {
	const navigation = useNavigation<NavigationType>();

	const handlePress = (destination: "favorites" | number) => {
		navigation.navigate("playlistContent", { destination: destination });
	};

	return (
		<>
			{type === "favorites" && (
				<TouchableOpacity
					style={styles.wrapper}
					onPress={() => handlePress("favorites")}>
					<Image source={FavoritePlaylist} style={styles.image} />
					<View style={{ flexDirection: "column" }}>
						<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
							{title}
						</Text>
						<Text style={{ fontSize: FontSize12 }}>" I like it !! "</Text>
					</View>
				</TouchableOpacity>
			)}
		</>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 20,
	},
	image: {
		width: 70,
		height: 70,
		marginRight: 15,
	},
});
