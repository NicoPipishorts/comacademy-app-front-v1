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
import ScreenHeaders from "../components/ScreenHeaders";
import { FontSize12, FontSize16 } from "../constants/fontsizes";
// Icons
import Chevron from "@/assets/imgs/icons/chevron.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Plus from "@/assets/imgs/icons/plus.png";
import SmallCategroieIcons from "@/components/SmallCategroieIcons";
import { useDicoById } from "@/hooks/useGetDico";
import { colorWhite } from "../constants/colors";

type Props = {
	item: {
		Word: string;
		id: number;
	};
	onGoBack: Dispatch<SetStateAction<boolean>>;
};

const EDGE_DISTANCE = 30;

function DicoDetails({ item, onGoBack }: Props) {
	const { data } = useDicoById(item.id);

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

	if (!data) return null;
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
										<View style={{ marginRight: 8 }}>
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
				<View style={styles.containerDefintion}>
					<Text style={styles.textDefinition}>
						{data.data.attributes.Definition}
					</Text>
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
