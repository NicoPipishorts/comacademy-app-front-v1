import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize16 } from "@/constants/fontsizes";
import React, { useCallback, useEffect, useState } from "react";
import {
	Image,
	ImageStyle,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
// Icons
import { useAddFavoriteDico } from "@/api/favoriteDico";
import Chevron from "@/assets/imgs/icons/chevron.png";
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Loader from "@/components/experience/loader";
import SmallCategroieIcons from "@/components/SmallCategroieIcons";
import { colorWhite } from "@/constants/colors";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { queryClient } from "@/hooks/reactQueryConfig";
import { useDicoById } from "@/hooks/useGetDico";
import useGetFavoriteDicos from "@/hooks/useGetFavoriteDicos";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";
import { NavigationType } from "@/types/general";
import { useLocalSearchParams, useNavigation } from "expo-router";

function DicoDetails() {
	const navigation = useNavigation<NavigationType>();
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const { id } = useLocalSearchParams();
	const dicoId = Number(id);

	const { isAndroid } = useDeviceTypeCheckers();

	const { data } = useDicoById(dicoId);
	const { data: favoritesRespons, isFetched: isFetchFavorites } =
		useGetFavoriteDicos(userId);

	const [filterIfFavoriteExists, setFilterIfFavoriteExists] =
		useState<boolean>(null);
	const [idArray, setIdArray] = useState<number[]>([]);
	const [dataId, setDataId] = useState<number>(null);

	const handleSuccess = () => {
		queryClient.refetchQueries({ queryKey: ["DicoFavorites", userId] });
	};

	const mutation = useAddFavoriteDico(handleSuccess);

	useEffect(() => {
		if (favoritesRespons?.data[0]) {
			const newArray = favoritesRespons?.data[0].attributes.words.data.map(
				(item) => item.id
			);
			setIdArray(newArray);
		}
	}, [favoritesRespons?.data]);

	useEffect(() => {
		if (idArray) {
			const doesItExist = idArray.some((id) => id === dicoId);
			if (doesItExist) {
				setFilterIfFavoriteExists(true);
			} else {
				setFilterIfFavoriteExists(false);
			}
		}
	}, [idArray, dicoId]);

	useEffect(() => {
		if (isFetchFavorites && favoritesRespons.data[0]) {
			setDataId(favoritesRespons.data[0].id);
		}
	}, [isFetchFavorites, favoritesRespons]);

	const handleAddFavorite = useCallback(() => {
		if (filterIfFavoriteExists) {
			const updatedIdArray = idArray.filter((id) => id !== dicoId);
			const updatedFavoriteDicos = [...updatedIdArray];
			mutation.mutate({ dataId, updatedFavoriteDicos, token });
		} else {
			const updatedFavoriteDicos = [...idArray, dicoId];
			if (!dataId) {
				mutation.mutate({ userId, updatedFavoriteDicos, token });
			} else {
				mutation.mutate({ dataId, updatedFavoriteDicos, token });
			}
		}
	}, [
		dataId,
		filterIfFavoriteExists,
		idArray,
		dicoId,
		mutation,
		token,
		userId,
	]);

	if (!data) {
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
				<ScreenHeaders content={data?.data.attributes.Word} />
			</View>

			<ScrollView
				style={styles.contentContainer}
				showsVerticalScrollIndicator={false}>
				<View style={styles.wrapperIcons}>
					<View style={styles.containerIcons}>
						{data.data.attributes.Categories !== undefined &&
						data.data.attributes.Categories !== null
							? data.data.attributes.Categories.split(",").map((cat, index) => {
									const categoryNumber = parseInt(cat, 10); // Convert string to number
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
				<View style={styles.containerDefintion}>
					<Text style={styles.textDefinition}>
						{data.data.attributes.Definition}
					</Text>
				</View>

				{/* <View style={styles.containerSatisfaction}>
					<Text style={styles.ttlSatisfaction}>Cette fiche a été utile :</Text>
					<TouchableOpacity style={styles.btnSatisfaction}>
						<Text style={styles.textSatisfaction}>Yes</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.btnSatisfaction}>
						<Text style={styles.textSatisfaction}>No</Text>
					</TouchableOpacity>
				</View> */}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
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
	containerDefintion: {
		backgroundColor: colorWhite,
		borderRadius: 25,
		marginHorizontal: 20,
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	textDefinition: {
		fontSize: FontSize16,
		lineHeight: 20,
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

export default DicoDetails;
