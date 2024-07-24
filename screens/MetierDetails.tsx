import { primaryBackground } from "@/constants/colors";
import React, { Dispatch, SetStateAction, useRef } from "react";
import {
	Dimensions,
	GestureResponderEvent,
	Image,
	ImageStyle,
	PanResponder,
	PanResponderGestureState,
	PanResponderInstance,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import HR from "../components/HR";
import ScreenHeaders from "../components/ScreenHeaders";
import { FontSize12, FontSize16, FontSizeH2 } from "../constants/fontsizes";
// Icons
import Chevron from "@/assets/imgs/icons/chevron.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Plus from "@/assets/imgs/icons/plus.png";
import SmallCategroieIcons from "@/components/SmallCategroieIcons";
import { MetierPayload } from "@/types/metiers";
import { useQuery } from "@tanstack/react-query";
import GradientContainer from "../components/GradientContainer";
import UnorderedList from "../components/UnorderedList";
import { colorWhite } from "../constants/colors";

type Props = {
	item: {
		METIER: string;
		id: number;
	};
	onGoBack: Dispatch<SetStateAction<boolean>>;
};

const EDGE_DISTANCE = 30;

function DetailsScreen({ item, onGoBack }: Props) {
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	const { data, isLoading } = useQuery<MetierPayload>({
		queryKey: ["metiersDetails"],
		queryFn: () =>
			fetch(`${apiUrl}/metiers/${item.id}`).then((res) => res.json()),
	});

	const panResponder: PanResponderInstance = useRef(
		PanResponder.create({
			onStartShouldSetPanResponder: (evt: GestureResponderEvent) => {
				return (
					evt.nativeEvent.locationX < EDGE_DISTANCE ||
					evt.nativeEvent.locationX >
						Dimensions.get("window").width - EDGE_DISTANCE
				);
			},
			onMoveShouldSetPanResponder: (_, gestureState) => {
				return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
			},
			onPanResponderRelease: (
				evt: GestureResponderEvent,
				gestureState: PanResponderGestureState
			) => {
				if (gestureState.dx > 50) {
					onGoBack(false);
				}
			},
		})
	).current;
	console.log("Metier Details Data: ", data);

	if (!data) return;
	return (
		<View style={styles.wrapper} {...panResponder.panHandlers}>
			<View style={styles.headerContainer}>
				<View style={styles.backBtnContainer}>
					<TouchableOpacity
						style={styles.backButton}
						onPress={() => onGoBack(false)}>
						<Image
							source={Chevron}
							style={styles.backBtnIcon as ImageStyle}
							resizeMode='contain'
						/>
						<Text style={styles.backBtnText}>Retour</Text>
					</TouchableOpacity>
				</View>
				<ScreenHeaders content={data.data.attributes.METIER} />
			</View>

			<ScrollView
				style={styles.contentContainer}
				showsVerticalScrollIndicator={false}>
				<View style={styles.wrapperIcons}>
					<View style={styles.containerIcons}>
						{data.data.attributes.CATEGORIE !== undefined &&
						data.data.attributes.CATEGORIE !== null
							? data.data.attributes.CATEGORIE.split(", ").map((cat) => {
									const categoryNumber = parseInt(cat, 10); // Convert string to number
									return (
										<SmallCategroieIcons
											key={categoryNumber}
											cats={categoryNumber}
										/>
									);
							  })
							: ""}
					</View>
					<View style={styles.containerIcons}>
						<Image
							source={Plus}
							style={[styles.catIcons, { marginRight: 20 }] as ImageStyle}
							resizeMode='contain'
						/>
						<Image
							source={Heart}
							style={styles.catIcons as ImageStyle}
							resizeMode='contain'
						/>
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
		paddingTop: 100,
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
	// Text related Styles
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

export default DetailsScreen;
