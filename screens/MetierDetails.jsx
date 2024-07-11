import { primaryBackground } from "@/constants/colors";
import React from "react";
import {
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import HR from "../components/HR";
import ScreenHeaders from "../components/ScreenHeaders";
import {
	FontSize12,
	FontSize16,
	FontSize20,
	FontSizeH2,
} from "../constants/fontsizes";
// Icons
import Cat1 from "@/assets/imgs/icons/cat_1.png";
import Cat2 from "@/assets/imgs/icons/cat_2.png";
import Cat3 from "@/assets/imgs/icons/cat_3.png";
import Cat4 from "@/assets/imgs/icons/cat_4.png";
import Chevron from "@/assets/imgs/icons/chevron.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Plus from "@/assets/imgs/icons/plus.png";
import GradientContainer from "../components/GradientContainer";
import UnorderedList from "../components/UnorderedList";
import { colorWhite } from "../constants/colors";

function DetailsScreen({ item, onGoBack }) {
	return (
		<View style={styles.wrapper}>
			<View style={styles.headerContainer}>
				<View style={styles.backBtnContainer}>
					<TouchableOpacity style={styles.backButton} onPress={onGoBack}>
						<Image
							source={Chevron}
							style={styles.backBtnIcon}
							resizeMode='contain'
						/>
						<Text style={styles.backBtnText}>Retour</Text>
					</TouchableOpacity>
				</View>
				<ScreenHeaders content={item.METIER} />
			</View>

			<ScrollView
				style={styles.contentContainer}
				showsVerticalScrollIndicator={false}>
				<View style={styles.wrapperIcons}>
					<View style={styles.containerIcons}>
						<Image source={Cat1} style={styles.catIcons} resizeMode='contain' />
						<Image source={Cat2} style={styles.catIcons} resizeMode='contain' />
						<Image source={Cat3} style={styles.catIcons} resizeMode='contain' />
						<Image source={Cat4} style={styles.catIcons} resizeMode='contain' />
					</View>
					<View style={styles.containerIcons}>
						<Image
							source={Plus}
							style={[styles.catIcons, { marginRight: 20 }]}
							resizeMode='contain'
						/>
						<Image
							source={Heart}
							style={styles.catIcons}
							resizeMode='contain'
						/>
					</View>
				</View>

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Rôle et Mission</Text>
				</View>

				<View>
					<Text style={styles.containerText}>{item.ROLE_MISSIONS}</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Compétence</Text>
				</View>

				<UnorderedList array={item.COMPETENCES} />

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Métiers Similaires</Text>
				</View>

				<View>
					<Text style={styles.containerText}>{item.METIERS_SIMILAIRES}</Text>
				</View>

				<GradientContainer
					title='Notre Avis'
					content={item.NOTRE_AVIS}
					colors={["#EF6D8C", "#FAB837"]}
				/>

				{/* <View style={styles.containerTitles}>
					<Text style={styles.textTitles}>Infos +</Text>
				</View>

				<View>
					<Text style={styles.containerText}>{item.desc.infos}</Text>
				</View>

				<HR /> */}

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>diplôme & formation</Text>
				</View>

				<View>
					<Text style={styles.containerText}>{item.FORMATION}</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>salaire moyen indicatif</Text>
				</View>

				<View>
					<Text style={styles.containerText}>{item.SALAIRES}</Text>
				</View>

				<HR />

				<View style={styles.containerTitles}>
					<Text style={styles.textTitles}>portrait chinois</Text>
				</View>

				<View>
					<Text style={styles.containerText}>{item.PORTRAIT_CHINOIS}</Text>
				</View>

				<GradientContainer
					title='verbatim'
					content={item.VERBATIM}
					colors={["#0DA2CC", "#93F6A0"]}
				/>

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
		alignItems: "center",
	},
	backButton: {
		flexDirection: "row",
		alignItems: "center",
	},
	backBtnContainer: {
		flexDirection: "row",
		fontSize: FontSize20,
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
		pading: 20,
	},
	containerSatisfaction: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 30,
		paddingTop: 50,
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
