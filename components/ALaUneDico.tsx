import { colorWhite } from "@/constants/colors";
import { FontSize12, FontSize20 } from "@/constants/fontsizes";
import useGetOneDico from "@/hooks/useGetOneDico";
import { NavigationType } from "@/types/general";
import { useNavigation } from "expo-router";
import moment from "moment";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Loader from "./experience/loader";
import StyledButton from "./StyledButton";

export default function ALaUneDico() {
	const navigation = useNavigation<NavigationType>();
	const { data, isFetched } = useGetOneDico();

	if (!isFetched) {
		return null;
	}

	const dico = data.data[0].attributes;
	const id = data.data[0].id;
	const handlePress = () => {
		navigation.navigate("dico", { openDetails: id });
	};

	return (
		<TouchableOpacity style={styles.container}>
			<Text style={styles.smallText}>
				La définition du jour : {moment(dico.updatedAt).format("DD/MM/YYYY")}
			</Text>
			<View style={styles.containerBis}>
				{!isFetched && <Loader />}
				{isFetched && (
					<>
						<Text
							style={styles.mainText}
							numberOfLines={2}
							ellipsizeMode='tail'>
							{dico.Word}
						</Text>
						<StyledButton
							title='Découvrir'
							handlePress={handlePress}
							variant='dark'
						/>
					</>
				)}
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: colorWhite,
		width: 350,
		minHeight: 100,
		padding: 15,
		borderRadius: 10,
		marginBottom: 20,
	},
	smallText: {
		fontSize: FontSize12,
		fontWeight: "bold",
		paddingBottom: 15,
	},
	containerBis: {
		flex: 0,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	mainText: {
		flex: 1,
		maxWidth: "65%",
		fontSize: FontSize20,
		fontWeight: "bold",
	},
});
