import HR from "@/components/HR";
import ScreenHeaders from "@/components/ScreenHeaders";
import { colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize16, FontSizeH2 } from "@/constants/fontsizes";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
// Icons
import metierFavoriteAdapter from "@/adapters/favorites/metierFavoriteAdapter";
import Plus from "@/assets/imgs/icons/plus.png";
import ActionIconButton from "@/components/buttons/actionIconButton";
import FavoriteToggleButton from "@/components/buttons/favoriteToggleButton";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import GradientContainer from "@/components/GradientContainer";
import SmallCategroieIcons from "@/components/icons/SmallCategroieIcons";
import AddToPlaylistModal from "@/components/modal/AddToPlaylistModal";
import UnorderedList from "@/components/UnorderedList";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { useGetMetierById } from "@/hooks/useGetMetiers";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
	metierId?: number | null;
}
export default function MetierDetails({ metierId: paramsMetierId }: Props) {
	const { id } = useLocalSearchParams();
	const [modalVisible, setModalVisible] = useState(false);
	const insets = useSafeAreaInsets();

	const routeIdParam = Array.isArray(id) ? id[0] : id;
	const parsedRouteId =
		routeIdParam !== undefined && routeIdParam !== null
			? Number(routeIdParam)
			: NaN;

	const hasPropId =
		typeof paramsMetierId === "number" && Number.isFinite(paramsMetierId);
	const metierId = hasPropId
		? (paramsMetierId as number)
		: Number.isFinite(parsedRouteId)
		? parsedRouteId
		: null;
	const { isAndroid } = useDeviceTypeCheckers();

	const { data } = useGetMetierById(metierId);

	const handleModalOpen = useCallback(() => setModalVisible(true), []);
	const handleModalClose = useCallback(() => setModalVisible(false), []);
	const { showTabBar, hideTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	if (metierId == null) {
		return (
			<View style={[styles.wrapper, { paddingTop: isAndroid ? 70 : 20 }]}>
				<View style={styles.headerContainer}>
					<ReturnButton />
					<ScreenHeaders content='Métiers' />
				</View>
				<Text style={styles.containerText}>
					Aucun métier sélectionné. Veuillez revenir à la liste.
				</Text>
			</View>
		);
	}

	if (!data) {
		return <Loader />;
	}

	return (
		<View
			style={[
				styles.wrapper,
				{
					paddingTop: isAndroid ? 70 : 20,
				},
			]}>
			<View style={styles.headerContainer}>
				<ReturnButton />
				<ScreenHeaders content={data.data.METIER} />
			</View>

			<ScrollView showsVerticalScrollIndicator={false}>
				<View style={styles.wrapperIcons}>
					<View style={styles.containerIcons}>
						{data.data.CATEGORIE !== undefined &&
						data.data.CATEGORIE !== null
							? data.data.CATEGORIE.split(",").map((cat, index) => {
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
						<ActionIconButton
							onPress={handleModalOpen}
							source={Plus}
							containerStyle={[styles.actionIcon, styles.addButton]}
							imageStyle={{ width: 28, height: 28 }}
						/>

						{/* Generic favorite toggle using the Dico adapter */}
						<FavoriteToggleButton
							key={`metier-heart-${metierId}`} // ⬅️ force remount on return/change
							targetId={metierId}
							adapter={metierFavoriteAdapter}
							containerStyle={styles.actionIcon}
							imageStyle={{ width: 28, height: 28 }}
						/>
					</View>
				</View>

				<View>
					<Text style={styles.containerText}>{data.data.TITRE}</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Métiers Similaires</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.METIERS_SIMILAIRES}
					</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Rôle et Mission</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.ROLE_MISSIONS}
					</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Compétence</Text>
				</View>

				<UnorderedList array={data.data.COMPETENCES} />

				<GradientContainer
					title='Notre Avis'
					content={data.data.NOTRE_AVIS}
					colors={["#EF6D8C", "#FAB837"]}
				/>

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>diplôme & formation</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.FORMATION}
					</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>salaire moyen indicatif</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.SALAIRES}
					</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>portrait chinois</Text>
				</View>

				<View>
					<Text style={styles.containerText}>
						{data.data.PORTRAIT_CHINOIS}
					</Text>
				</View>

				<GradientContainer
					title='verbatim'
					content={data.data.VERBATIM}
					colors={["#0DA2CC", "#93F6A0"]}
				/>

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>
						BREF, TU VAS ADORER CE METIER SI….
					</Text>
				</View>

				<View style={{ marginBottom: insets.bottom + 20 }}>
					<Text style={styles.containerText}>{data.data.BREF}</Text>
				</View>
			</ScrollView>

			<AddToPlaylistModal
				visible={modalVisible}
				onClose={handleModalClose}
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
	actionIcon: {
		width: 24,
		height: 24,
		aspectRatio: 1,
		marginRight: 5,
	},
	addButton: {
		marginRight: 20,
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
