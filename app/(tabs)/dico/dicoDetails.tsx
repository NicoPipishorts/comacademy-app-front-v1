// File: src/components/leJeu/DicoDetails.tsx
import { useLocalSearchParams } from "expo-router";
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
	Image,
	ImageStyle,
	LayoutChangeEvent,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

// Components
import ScreenHeaders from "@/components/ScreenHeaders";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import SmallCategroieIcons from "@/components/icons/SmallCategroieIcons";
import AddToPlaylistModal from "@/components/modal/AddToPlaylistModal";
import SwipeToGoBack from "@/utils/swipeToGoBack";

// Hooks & API
import { useAddFavoriteDico } from "@/api/favoriteDico";
import useDeviceTypeCheckers from "@/helpers/deviceModel";
import { queryClient } from "@/hooks/reactQueryConfig";
import { useDicoById } from "@/hooks/useGetDico";
import useGetFavoriteDicos from "@/hooks/useGetFavoriteDicos";
import useJwtToken from "@/hooks/useJwtToken";
import useUserId from "@/hooks/useUserId";

// Constants
import { colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16 } from "@/constants/fontsizes";

// Icons
import HeartFull from "@/assets/imgs/icons/heart-full.png";
import Heart from "@/assets/imgs/icons/heart.png";
import Plus from "@/assets/imgs/icons/plus.png";
import { Entypo } from "@expo/vector-icons";

interface Props {
	dicoId?: number;
}

interface FavoriteState {
	isFavorite: boolean;
	favoriteIds: number[];
	favoriteDataId: number | null;
}

export default function DicoDetails({ dicoId: paramsDicoId }: Props) {
	const { userId } = useUserId();
	const { token } = useJwtToken();
	const { id } = useLocalSearchParams();
	const { isAndroid } = useDeviceTypeCheckers();

	// Modal visibility
	const [modalVisible, setModalVisible] = useState(false);

	// Measure definition heights
	const [def1Height, setDef1Height] = useState(0);
	const [def2Height, setDef2Height] = useState(0);

	// 60% of viewport height
	const windowHeight = Dimensions.get("window").height;
	const sixtyDvh = windowHeight * 0.5;

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
	const { data: favoritesResponse } = useGetFavoriteDicos(userId);

	// Compute favorite state
	const favoriteState: FavoriteState = useMemo(() => {
		if (!favoritesResponse?.data?.[0]) {
			return { isFavorite: false, favoriteIds: [], favoriteDataId: null };
		}
		const favData = favoritesResponse.data[0];
		const ids = favData.attributes.words.data.map((item) => item.id);
		return {
			isFavorite: ids.includes(dicoId),
			favoriteIds: ids,
			favoriteDataId: favData.id,
		};
	}, [favoritesResponse, dicoId]);

	// Setup mutation
	const handleMutationSuccess = useCallback(() => {
		queryClient.refetchQueries({ queryKey: ["DicoFavorites", userId] });
	}, [userId]);
	const mutation = useAddFavoriteDico(handleMutationSuccess);

	const handleAddFavorite = useCallback(() => {
		const { isFavorite, favoriteIds, favoriteDataId } = favoriteState;
		let updatedIds: number[];
		if (isFavorite) {
			updatedIds = favoriteIds.filter((i) => i !== dicoId);
			mutation.mutate({
				dataId: favoriteDataId!,
				updatedFavoriteDicos: updatedIds,
				token,
			});
		} else {
			updatedIds = [...favoriteIds, dicoId];
			const params = favoriteDataId
				? { dataId: favoriteDataId, updatedFavoriteDicos: updatedIds, token }
				: { userId, updatedFavoriteDicos: updatedIds, token };
			mutation.mutate(params);
		}
	}, [favoriteState, dicoId, mutation, token, userId]);

	const handleModalOpen = useCallback(() => setModalVisible(true), []);
	const handleModalClose = useCallback(() => setModalVisible(false), []);

	// Parse categories
	const categories = useMemo(() => {
		const s = dicoData?.data?.attributes?.Categories;
		return s ? s.split(",").map((c) => parseInt(c.trim(), 10)) : [];
	}, [dicoData?.data?.attributes?.Categories]);

	if (!dicoData) {
		return <Loader />;
	}

	const { Word, Definition, extraContext } = dicoData.data.attributes;

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
				<ScrollView style={styles.contentContainer}>
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
							<ActionButton
								onPress={handleModalOpen}
								source={Plus}
								style={styles.addButton}
							/>
							<ActionButton
								onPress={handleAddFavorite}
								source={favoriteState.isFavorite ? HeartFull : Heart}
							/>
						</View>
					</View>
					{/* Definition #1 */}
					<View
						style={styles.definitionContainer}
						onLayout={(e: LayoutChangeEvent) =>
							setDef1Height(e.nativeEvent.layout.height)
						}>
						<Text style={styles.definitionText}>{Definition}</Text>
					</View>
					{/* Definition #2 */}
					{extraContext && (
						<View
							style={styles.definitionContainer}
							onLayout={(e: LayoutChangeEvent) =>
								setDef2Height(e.nativeEvent.layout.height)
							}>
							<Text style={styles.definitionText}>{extraContext}</Text>
						</View>
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

interface ActionButtonProps {
	onPress: () => void;
	source: any;
	style?: ImageStyle;
}

function ActionButton({ onPress, source, style }: ActionButtonProps) {
	return (
		<Pressable onPress={onPress}>
			<Image
				source={source}
				style={[styles.actionIcon, style]}
				resizeMode='contain'
			/>
		</Pressable>
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
	contentContainer: {
		marginBottom: 100,
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
		bottom: 90,
		left: 0,
		right: 0,
		alignItems: "center",
		zIndex: 10,
	},
});
