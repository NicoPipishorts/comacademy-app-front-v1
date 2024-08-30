import { primaryBackground } from "@/constants/colors";
import useCategories from "@/hooks/useCategories";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenHeaders from "../../components/ScreenHeaders";

const Playlist = () => {
	const { data: categories } = useCategories();

	console.log(categories);
	return (
		<View style={styles.wrapper}>
			<ScreenHeaders content='Mon Profil' />
			<ScreenHeaders content='Mes Stats' />
			<View>
				<View>
					<Text>Stats</Text>
					<Text>Tes résultats par catégories</Text>
				</View>
				<View>
					<View></View>
					<View></View>
					<View></View>
					<View></View>
					<View></View>
					<View></View>
				</View>
				<View>
					<Text>Découvre tes résultats selon les catégories</Text>
					<TouchableOpacity>
						<Text>Voir</Text>
					</TouchableOpacity>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 80,
		backgroundColor: primaryBackground,
	},
});

export default Playlist;
