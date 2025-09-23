import FavoritePlaylist from "@/assets/imgs/icons/FavoritePlaylist.png";
import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	title: string;
	type: "favorites" | "metiers" | "dicos" | "citations";
}

export default function CardFavoritesList({ title, type }: Props) {
	const navigation = useNavigation<NavigationType>();

	const handlePress = () => {
		switch (type) {
			case "favorites":
				navigation.navigate("questionsFavoritesList");
				break;

			case "metiers":
				navigation.navigate("metiersFavoritesList");
				break;

			case "dicos":
				navigation.navigate("dicosFavoritesList");
				break;
			case "citations":
				navigation.navigate("citationsFavoritesList");
				break;
		}
	};

	return (
		<>
			{type === "favorites" && (
				<TouchableOpacity style={styles.wrapper} onPress={() => handlePress()}>
					<Image source={FavoritePlaylist} style={styles.image} />
					<View style={{ flexDirection: "column" }}>
						<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
							{title}
						</Text>
						<Text style={{ fontSize: FontSize12 }}>" I like it !! "</Text>
					</View>
				</TouchableOpacity>
			)}
			{type === "metiers" && (
				<TouchableOpacity style={styles.wrapper} onPress={() => handlePress()}>
					<Image source={FavoritePlaylist} style={styles.image} />
					<View style={{ flexDirection: "column" }}>
						<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
							{title}
						</Text>
						<Text style={{ fontSize: FontSize12 }}>
							" Quel job pour moi ?! "
						</Text>
					</View>
				</TouchableOpacity>
			)}
			{type === "dicos" && (
				<TouchableOpacity style={styles.wrapper} onPress={() => handlePress()}>
					<Image source={FavoritePlaylist} style={styles.image} />
					<View style={{ flexDirection: "column" }}>
						<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
							{title}
						</Text>
						<Text style={{ fontSize: FontSize12 }}>
							" A savoir par cœur ! ?! "
						</Text>
					</View>
				</TouchableOpacity>
			)}
			{type === "citations" && (
				<TouchableOpacity style={styles.wrapper} onPress={() => handlePress()}>
					<Image source={FavoritePlaylist} style={styles.image} />
					<View style={{ flexDirection: "column" }}>
						<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
							{title}
						</Text>
						<Text style={{ fontSize: FontSize12 }}>
							" Bol d'inspiration ! "
						</Text>
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
		marginVertical: 12,
	},
	image: {
		width: 70,
		height: 70,
		marginRight: 15,
	},
});
