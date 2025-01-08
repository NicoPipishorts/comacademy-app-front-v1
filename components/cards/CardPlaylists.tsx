import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import { NavigationType } from "@/types/general";
import PlaylistDisplayImage from "@/utils/playlist/PlaylistDisplayImage";
import { useNavigation } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	id: number;
	title: string;
	color: string;
}

export default function CardPlaylist({ title, color, id }: Props) {
	const navigation = useNavigation<NavigationType>();

	const handlePress = () => {
		navigation.navigate("playlistList", { playlistId: id });
	};

	return (
		<>
			<TouchableOpacity style={styles.wrapper} onPress={() => handlePress()}>
				<PlaylistDisplayImage
					title={title}
					image={color}
					width={70}
					height={70}
				/>

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
		marginVertical: 12,
	},
});
