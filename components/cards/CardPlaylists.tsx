import { colorWhite } from "@/constants/colors";
import { FontSize12, FontSize18, FontSizeH1 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import { getInitials } from "@/utils/getInitials";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	title: string;
	color: string;
}

export default function CardPlaylist({ title, color }: Props) {
	const navigation = useNavigation<NavigationType>();

	const handlePress = () => {
		navigation.navigate("questionsFavoritesList");
	};

	console.log(color);

	return (
		<>
			<TouchableOpacity style={styles.wrapper} onPress={() => handlePress()}>
				{/* <Image source={{ uri: randomPattern }} style={styles.image} /> */}
				<View style={[styles.image, { backgroundColor: `${color}` }]}>
					<Text style={styles.imageText}>{getInitials(title)}</Text>
				</View>
				<View style={{ flexDirection: "column" }}>
					<Text style={{ fontSize: FontSize18, fontWeight: "bold" }}>
						{title}
					</Text>
					<Text style={{ fontSize: FontSize12 }}>" I like it !! "</Text>
				</View>
			</TouchableOpacity>
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
		alignItems: "center",
		justifyContent: "center",
		width: 70,
		height: 70,
		marginRight: 15,
		borderRadius: 10,
	},
	imageText: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		color: colorWhite,
	},
});
