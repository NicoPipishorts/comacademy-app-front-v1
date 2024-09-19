import { primaryBackground } from "@/constants/colors";
import React, { useEffect, useState } from "react";
import {
	Image,
	ImageStyle,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import HR from "../../../components/HR";
import ScreenHeaders from "../../../components/ScreenHeaders";
import {
	FontSize12,
	FontSize16,
	FontSizeH2,
} from "../../../constants/fontsizes";
// Icons
import { useAddFavoritesMetierMutation } from "@/api/favoriteMetier";
import Chevron from "@/assets/imgs/icons/chevron.png";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Loader from "@/components/experience/loader";
import SmallCategroieIcons from "@/components/SmallCategroieIcons";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { queryClient } from "@/hooks/reactQueryConfig";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import { useGetMetierById } from "@/hooks/useGetMetiers";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { NavigationType } from "@/types/general";
import { FavoriteMetier } from "@/types/metiers";
import { useLocalSearchParams, useNavigation } from "expo-router";
import GradientContainer from "../../../components/GradientContainer";
import UnorderedList from "../../../components/UnorderedList";
import { colorWhite } from "../../../constants/colors";

interface Props {
	metierId: number;
}
export default function MetierDetails({ metierId: paramsMetierId }: Props) {
	const navigation = useNavigation<NavigationType>();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const { id } = useLocalSearchParams();

	// Parse the 'id' to a number if it exists
	const metierId = paramsMetierId ? paramsMetierId : Number(id);
	const { isAndroid } = useDeviceTypeCheckers();

	const { data } = useGetMetierById(metierId);
	const { data: dataFavoritesMetier } = useGetFavoriteMetiers(userId);

	const [filterIfFavoriteExists, setFilterIfFavoriteExists] =
		useState<boolean>(null);

	const handleSuccess = () => {
		queryClient.refetchQueries({ queryKey: ["FavoriteMetiers"] });
	};

	const mutation = useAddFavoritesMetierMutation(handleSuccess);

	// Check if the metier has already been added to the favorites list.
	const favorites: FavoriteMetier[] =
		dataFavoritesMetier.data[0].attributes.metiers.data;

	useEffect(() => {
		if (favorites) {
			const exists = favorites.some((favorite) => favorite.id === metierId);
			setFilterIfFavoriteExists(exists);
		}
	}, [favorites, metierId]);

	if (!data || !dataFavoritesMetier) {
		return <Loader />;
	}

	const idArray = favorites.map((favorite) => favorite.id);
	const handleAddFavorite = () => {
		if (filterIfFavoriteExists) {
			const updatedIdArray = idArray.filter((id) => id !== metierId);
			const updatedFavoriteMetiers = [...updatedIdArray];
			mutation.mutate({ userId, updatedFavoriteMetiers, token });
		} else {
			const updatedFavoriteMetiers = [...idArray, metierId];
			mutation.mutate({ userId, updatedFavoriteMetiers, token });
		}
	};

	return (
		<View
			style={[
				styles.wrapper,
				{
					paddingTop: isAndroid ? 70 : 20,
					paddingBottom: isAndroid ? 70 : 20,
				},
			]}>
			<View style={styles.headerContainer}>
				{isAndroid && (
					<View style={styles.backBtnContainer}>
						<TouchableOpacity
							style={styles.backButton}
							onPress={() => navigation.navigate("index")}>
							<Image
								source={Chevron}
								style={styles.backBtnIcon as ImageStyle}
								resizeMode='contain'
							/>
							<Text style={styles.backBtnText}>Retour</Text>
						</TouchableOpacity>
					</View>
				)}
				<ScreenHeaders content={data.data.attributes.METIER} />
			</View>

			<ScrollView
				style={styles.contentContainer}
				showsVerticalScrollIndicator={false}>
				<View style={styles.wrapperIcons}>
					<View style={styles.containerIcons}>
						{data.data.attributes.CATEGORIE !== undefined &&
						data.data.attributes.CATEGORIE !== null
							? data.data.attributes.CATEGORIE.split(",").map((cat, index) => {
									const categoryNumber = parseInt(cat, 10);
									return (
										<View key={index} style={{ marginRight: 8 }}>
											<SmallCategroieIcons
												key={categoryNumber}
												cats={categoryNumber}
											/>
										</View>
									);
							  })
							: ""}
					</View>
					<View style={styles.containerIcons}>
						{/* <Image
							source={Plus}
							style={[styles.catIcons, { marginRight: 20 }] as ImageStyle}
							resizeMode='contain'
						/> */}
						<TouchableOpacity onPress={() => handleAddFavorite()}>
							<Image
								source={filterIfFavoriteExists ? HeartFull : Heart}
								style={styles.catIcons as ImageStyle}
								resizeMode='contain'
							/>
						</TouchableOpacity>
					</View>
				</View>

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Rôle et Mission</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.attributes.ROLE_MISSIONS}
					</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Compétence</Text>
				</View>

				<UnorderedList array={data.data.attributes.COMPETENCES} />

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Métiers Similaires</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.attributes.METIERS_SIMILAIRES}
					</Text>
				</View>

				<GradientContainer
					title='Notre Avis'
					content={data.data.attributes.NOTRE_AVIS}
					colors={["#EF6D8C", "#FAB837"]}
				/>

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>diplôme & formation</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.attributes.FORMATION}
					</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>salaire moyen indicatif</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.attributes.SALAIRES}
					</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>portrait chinois</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.attributes.PORTRAIT_CHINOIS}
					</Text>
				</View>

				<GradientContainer
					title='verbatim'
					content={data.data.attributes.VERBATIM}
					colors={["#0DA2CC", "#93F6A0"]}
				/>

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>
						BREF, TU VAS ADORER CE METIER SI….
					</Text>
				</View>

				<View>
					<Text style={styles.containerText}>{data.data.attributes.BREF}</Text>
				</View>

				<View style={styles.containerSatisfaction}>
					<Text style={styles.ttlSatisfaction}>Cette fiche a été utile :</Text>
					<TouchableOpacity style={styles.btnSatisfaction}>
						<Text style={styles.textSatisfaction}>Yes</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btnSatisfaction}>
						<Text style={styles.textSatisfaction}>No</Text>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		paddingTop: 30,
		backgroundColor: primaryBackground,
	},
	headerContainer: {
		paddingHorizontal: 25,
	},
	backBtnContainer: {
		alignItems: "flex-start",
	},
	backButton: {
		flexDirection: "row",
		alignItems: "center",
	},
	backBtnText: {
		fontSize: FontSize12,
		fontWeight: "bold",
	},
	backBtnIcon: {
		width: 15,
		height: 15,
		aspectRatio: 1,
		marginRight: 3,
	},
	contentContainer: {
		marginBottom: 50,
	},
	wrapperIcons: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 30,
		marginVertical: 10,
	},
	containerIcons: {
		flexDirection: "row",
		marginBottom: 50,
	},
	catIcons: {
		width: 24,
		height: 24,
		aspectRatio: 1,
		marginRight: 5,
	},
	containerTitles: {
		marginBottom: 20,
		paddingHorizontal: 30,
	},
	textTitles: {
		fontSize: FontSizeH2,
		fontWeight: "bold",
		textTransform: "uppercase",
	},
	containerText: {
		fontSize: FontSize16,
		lineHeight: 20,
		paddingHorizontal: 30,
	},
	gradientContainer: {
		padding: 20,
	},
	containerSatisfaction: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 30,
		paddingTop: 100,
		paddingBottom: 80,
	},
	ttlSatisfaction: {
		fontSize: FontSize12,
		fontWeight: "bold",
		marginRight: 20,
	},
	btnSatisfaction: {
		backgroundColor: colorWhite,
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderRadius: 50,
		marginHorizontal: 10,
	},
	textSatisfaction: {
		fontWeight: "bold",
	},
});
