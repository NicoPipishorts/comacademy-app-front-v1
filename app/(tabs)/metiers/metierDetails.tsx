import HR from "@/components/HR";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize16, FontSizeH2 } from "@/constants/fontsizes";
import React, { useCallback, useEffect, useState } from "react";
import {
	Image,
	ImageStyle,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
// Icons
import { useAddFavoritesMetierMutation } from "@/api/favoriteMetier";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Plus from "@/assets/imgs/icons/plus.png";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import GradientContainer from "@/components/GradientContainer";
import SmallCategroieIcons from "@/components/icons/SmallCategroieIcons";
import AddToPlaylistModal from "@/components/modal/AddToPlaylistModal";
import UnorderedList from "@/components/UnorderedList";
import { colorWhite } from "@/constants/colors";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { queryClient } from "@/hooks/reactQueryConfig";
import useGetFavoriteMetiers from "@/hooks/useGetFavoriteMetiers";
import { useGetMetierById } from "@/hooks/useGetMetiers";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { useLocalSearchParams } from "expo-router";

interface Props {
	metierId: number;
}
export default function MetierDetails({ metierId: paramsMetierId }: Props) {
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const { id } = useLocalSearchParams();
	const [modalVisible, setModalVisible] = useState(false);

	const metierId = paramsMetierId ? paramsMetierId : Number(id);
	const { isAndroid } = useDeviceTypeCheckers();

	const { data } = useGetMetierById(metierId);
	const { data: dataFavoritesMetier, isFetched: isFetchFavoritesMetier } =
		useGetFavoriteMetiers(userId);

	const [filterIfFavoriteExists, setFilterIfFavoriteExists] =
		useState<boolean>(null);
	const [idArray, setIdArray] = useState<number[]>([]);
	const [dataId, setDataId] = useState<number>(null);

	const handleSuccess = () => {
		queryClient.refetchQueries({ queryKey: ["FavoriteMetiers"] });
	};

	const mutation = useAddFavoritesMetierMutation(handleSuccess);

	useEffect(() => {
		if (dataFavoritesMetier?.data[0]) {
			const newArray = dataFavoritesMetier?.data[0].attributes.metiers.data.map(
				(item) => item.id
			);
			setIdArray(newArray);
		}
	}, [dataFavoritesMetier?.data]);

	useEffect(() => {
		if (idArray) {
			const doesItExist = idArray.some((id) => id === metierId);
			if (doesItExist) {
				setFilterIfFavoriteExists(true);
			} else {
				setFilterIfFavoriteExists(false);
			}
		}
	}, [idArray, metierId]);

	useEffect(() => {
		if (isFetchFavoritesMetier && dataFavoritesMetier.data[0]) {
			setDataId(dataFavoritesMetier.data[0].id);
		}
	}, [isFetchFavoritesMetier, dataFavoritesMetier]);

	const handleAddFavorite = useCallback(() => {
		if (filterIfFavoriteExists) {
			const updatedIdArray = idArray.filter((id) => id !== metierId);
			const updatedFavoriteMetiers = [...updatedIdArray];
			mutation.mutate({ dataId, updatedFavoriteMetiers, token });
		} else {
			const updatedFavoriteMetiers = [...idArray, metierId];
			if (!dataId) {
				mutation.mutate({ userId, updatedFavoriteMetiers, token });
			} else {
				mutation.mutate({ dataId, updatedFavoriteMetiers, token });
			}
		}
	}, [
		dataId,
		filterIfFavoriteExists,
		idArray,
		metierId,
		mutation,
		token,
		userId,
	]);

	if (!data || !dataFavoritesMetier || !isFetchFavoritesMetier) {
		return <Loader />;
	}

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
				<ReturnButton />
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
						<Pressable onPress={() => setModalVisible(true)}>
							<Image
								source={Plus}
								style={[styles.catIcons, { marginRight: 20 }] as ImageStyle}
								resizeMode='contain'
							/>
						</Pressable>
						<Pressable onPress={() => handleAddFavorite()}>
							<Image
								source={filterIfFavoriteExists ? HeartFull : Heart}
								style={styles.catIcons as ImageStyle}
								resizeMode='contain'
							/>
						</Pressable>
					</View>
				</View>

				<View>
					<Text style={styles.containerText}>{data.data.attributes.TITRE}</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Métiers Similaires</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.attributes.METIERS_SIMILAIRES}
					</Text>
				</View>

				<HR />

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
			</ScrollView>

			<AddToPlaylistModal
				visible={modalVisible}
				onClose={() => setModalVisible(false)}
				elementId={metierId}
				type='metier'
			/>
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
	contentContainer: {
		marginBottom: 100,
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
