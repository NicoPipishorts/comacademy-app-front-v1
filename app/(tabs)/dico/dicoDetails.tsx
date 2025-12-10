import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Animated,
	Dimensions,
	Easing,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

// Components
import ScreenHeaders from "@/components/ScreenHeaders";
import ActionIconButton from "@/components/buttons/actionIconButton";
import FavoriteToggleButton from "@/components/buttons/favoriteToggleButton";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import SmallCategroieIcons from "@/components/icons/SmallCategroieIcons";
import AddToPlaylistModal from "@/components/modal/AddToPlaylistModal";
import { useTabBarVisibility } from "@/context/TabBarVisibilityContext";
import SwipeToGoBack from "@/utils/swipeToGoBack";

// Adapters
import dicoFavoriteAdapter from "@/adapters/favorites/dicoFavoriteAdapter";

// Hooks & API
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { useDicoById } from "@/hooks/useGetDico";

// Constants
import { colorWhite, colorYellow, primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";

// Icons
import Plus from "@/assets/imgs/icons/plus.png";
import { Entypo } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface Props {
	dicoId?: number;
}

export default function DicoDetails({ dicoId: paramsDicoId }: Props) {
	const { id } = useLocalSearchParams();
	const { isAndroid } = useDeviceTypeCheckers();
	const { showTabBar, hideTabBar } = useTabBarVisibility();

	useFocusEffect(
		useCallback(() => {
			hideTabBar();
			return () => showTabBar();
		}, [hideTabBar, showTabBar])
	);

	// Modal visibility
	const [modalVisible, setModalVisible] = useState(false);

	// Measure definition heights
	const [def1Height, setDef1Height] = useState(0);
	const [def2Height, setDef2Height] = useState(0);

	// 60% of viewport height
	const windowHeight = Dimensions.get("window").height;
	const sixtyDvh = windowHeight * 0.6;

	// Flag: true if combined definitions exceed 60dvh
	const defsTooTall = def1Height + def2Height > sixtyDvh;

	// Arrow animation value
	const arrowAnim = useRef(new Animated.Value(0)).current;
	useEffect(() => {
		Animated.loop(
			Animated.sequence([
				Animated.timing(arrowAnim, {
					toValue: -4,
					duration: 800,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(arrowAnim, {
					toValue: 0,
					duration: 800,
					easing: Easing.inOut(Easing.ease),
					useNativeDriver: true,
				}),
			])
		).start();
	}, [arrowAnim]);

	// Determine dicoId
	const dicoId = paramsDicoId !== undefined ? paramsDicoId : Number(id || 0);

	// Fetch data
	const { data: dicoData } = useDicoById(dicoId);

	// Parse categories (Strapi v5: no attributes wrapper)
	const categories = useMemo(() => {
		const s = dicoData?.data?.Categories;
		return s ? s.split(",").map((c) => parseInt(c.trim(), 10)) : [];
	}, [dicoData?.data?.Categories]);

	const handleModalOpen = useCallback(() => setModalVisible(true), []);
	const handleModalClose = useCallback(() => setModalVisible(false), []);

	if (!dicoData) {
		return <Loader />;
	}

	// Strapi v5: data directly without attributes wrapper
	const { Word, Definition, extraContext } = dicoData.data;

	return (
		<SwipeToGoBack>
			<View
				style={[
					styles.wrapper,
					{
						paddingTop: isAndroid ? 70 : 20,
						paddingBottom: isAndroid ? 70 : 20,
					},
				]}>
				{/* Header */}
				<View style={styles.headerContainer}>
					<ReturnButton />
					<ScreenHeaders content={Word} />
				</View>

				{/* Content */}
				<ScrollView>
					{/* Category & Action Icons */}
					<View style={styles.iconsWrapper}>
						<View style={styles.iconsContainer}>
							{categories.map((cat) => (
								<View key={cat} style={styles.categoryIconWrapper}>
									<SmallCategroieIcons cats={cat} />
								</View>
							))}
						</View>

						<View style={styles.iconsContainer}>
							<ActionIconButton
								onPress={handleModalOpen}
								source={Plus}
								containerStyle={[styles.actionIcon, styles.addButton]}
								imageStyle={{ width: 28, height: 28 }}
							/>

							{/* Generic favorite toggle using the Dico adapter */}
							<FavoriteToggleButton
								targetId={dicoId}
								adapter={dicoFavoriteAdapter}
								containerStyle={styles.actionIcon}
								imageStyle={{ width: 28, height: 28 }}
							/>
						</View>
					</View>

					{/* Definition #1 */}
					<View
						style={styles.definitionContainer}
						onLayout={(e) => setDef1Height(e.nativeEvent.layout.height)}>
						<Text style={styles.definitionText}>{Definition}</Text>
					</View>

					{/* Definition #2 */}
					{extraContext && (
						<LinearGradient
							colors={[colorYellow, "#FCA9AC"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 0, y: 1 }}
							style={styles.definitionContainer}
							onLayout={(e) => setDef2Height(e.nativeEvent.layout.height)}>
							<Text
								style={[
									styles.definitionText,
									{ fontWeight: "bold", marginBottom: 10 },
								]}>
								En savoir +
							</Text>
							<Text style={styles.definitionText}>{extraContext}</Text>
						</LinearGradient>
					)}
				</ScrollView>

				{/* Animated arrow if definitions too tall */}
				{defsTooTall && (
					<Animated.View
						style={[
							styles.arrowDown,
							{ transform: [{ translateY: arrowAnim }] },
						]}>
						<Entypo name='chevron-down' size={40} color='rgba(0,0,0,0.7)' />
					</Animated.View>
				)}

				{/* Modal */}
				<AddToPlaylistModal
					visible={modalVisible}
					onClose={handleModalClose}
					elementId={dicoId}
					type='dico'
				/>
			</View>
		</SwipeToGoBack>
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
	iconsWrapper: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 30,
		marginVertical: 10,
	},
	iconsContainer: {
		flexDirection: "row",
		marginBottom: 50,
	},
	categoryIconWrapper: {
		marginRight: 8,
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
	definitionContainer: {
		backgroundColor: colorWhite,
		borderRadius: 25,
		marginHorizontal: 20,
		marginBottom: 20,
		paddingHorizontal: 20,
		paddingVertical: 30,
	},
	definitionText: {
		fontSize: FontSize16,
		lineHeight: 20,
	},
	arrowDown: {
		position: "absolute",
		bottom: 20,
		left: 0,
		right: 0,
		alignItems: "center",
		zIndex: 10,
	},
});
