import Image1 from "@/assets/imgs/icons/playlists/1.png";
import Image10 from "@/assets/imgs/icons/playlists/10.png";
import Image11 from "@/assets/imgs/icons/playlists/11.png";
import Image12 from "@/assets/imgs/icons/playlists/12.png";
import Image13 from "@/assets/imgs/icons/playlists/13.png";
import Image14 from "@/assets/imgs/icons/playlists/14.png";
import Image2 from "@/assets/imgs/icons/playlists/2.png";
import Image3 from "@/assets/imgs/icons/playlists/3.png";
import Image4 from "@/assets/imgs/icons/playlists/4.png";
import Image5 from "@/assets/imgs/icons/playlists/5.png";
import Image6 from "@/assets/imgs/icons/playlists/6.png";
import Image7 from "@/assets/imgs/icons/playlists/7.png";
import Image8 from "@/assets/imgs/icons/playlists/8.png";
import Image9 from "@/assets/imgs/icons/playlists/9.png";

import {
	colorBlack,
	colorRed,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize16, FontSize18 } from "@/constants/fontsizes";
import useGetPlaylistById from "@/hooks/Playlistss/useGetPlaylistById";
import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	Image,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import ModalGestureLine from "../experience/modalGestureLine";
import { colorArray } from "../user/changeAvatar";

interface NewPlaylistModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (name: string, selectedColor: string) => void;
	playlistId?: number | null;
}

const IMAGE_OPTIONS = [
	{ name: "1", image: Image1 },
	{ name: "2", image: Image2 },
	{ name: "3", image: Image3 },
	{ name: "4", image: Image4 },
	{ name: "5", image: Image5 },
	{ name: "6", image: Image6 },
	{ name: "7", image: Image7 },
	{ name: "8", image: Image8 },
	{ name: "9", image: Image9 },
	{ name: "10", image: Image10 },
	{ name: "11", image: Image11 },
	{ name: "12", image: Image12 },
	{ name: "13", image: Image13 },
	{ name: "14", image: Image14 },
];

const SNAP_POINTS = ["60%"];

const NewPlaylistModal = ({
	visible,
	onClose,
	onSubmit,
	playlistId,
}: NewPlaylistModalProps) => {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => SNAP_POINTS, []);
	const [playlistName, setPlaylistName] = useState("");
	const [selectedColor, setSelectedColor] = useState<string | undefined>();
	const [errorPlaylistName, setErrorPlaylistName] = useState(false);

	const randomPool = useMemo(
		() => [...IMAGE_OPTIONS.map((item) => item.name), ...colorArray],
		[]
	);

	const hasPlaylist = playlistId !== undefined && playlistId !== null;
	const playlistQueryId = hasPlaylist ? playlistId! : 0;
	const { data: playlistData, isFetched } = useGetPlaylistById(playlistQueryId);

	const resetForm = useCallback(() => {
		setPlaylistName("");
		setSelectedColor(undefined);
		setErrorPlaylistName(false);
	}, []);

	useEffect(() => {
		if (hasPlaylist && playlistData) {
			setPlaylistName(playlistData.data.attributes.name ?? "");
			setSelectedColor(playlistData.data.attributes.selectedColor ?? undefined);
			setErrorPlaylistName(false);
		} else if (!hasPlaylist) {
			resetForm();
		}
	}, [hasPlaylist, playlistData, resetForm]);

	useEffect(() => {
		if (visible) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [visible]);

	const handleDismiss = useCallback(() => {
		resetForm();
		onClose();
	}, [onClose, resetForm]);

	const handleNameChange = useCallback(
		(value: string) => {
			setPlaylistName(value);
			if (errorPlaylistName) {
				setErrorPlaylistName(false);
			}
		},
		[errorPlaylistName]
	);

	const handleSelectColor = useCallback((color: string) => {
		setSelectedColor(color);
	}, []);

	const handleSubmit = useCallback(() => {
		const trimmedName = playlistName.trim();
		if (!trimmedName) {
			setErrorPlaylistName(true);
			return;
		}
		const color =
			selectedColor ??
			randomPool[Math.floor(Math.random() * randomPool.length)];
		onSubmit(trimmedName, color);
		bottomSheetRef.current?.dismiss();
	}, [onSubmit, playlistName, selectedColor, randomPool]);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior='close'
			/>
		),
		[]
	);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			index={0}
			snapPoints={snapPoints}
			backdropComponent={renderBackdrop}
			backgroundStyle={styles.sheetBackground}
			handleIndicatorStyle={styles.hiddenIndicator}
			enablePanDownToClose
			onDismiss={handleDismiss}>
			<BottomSheetScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.sheetInner}>
					<ModalGestureLine />
					<Text style={styles.title}>
						{hasPlaylist
							? "Modifier la playlist"
							: "Créer une nouvelle playlist"}
					</Text>

					<View style={styles.sectionSpacing}>
						<TextInput
							style={[styles.input, errorPlaylistName && styles.inputError]}
							placeholder='Nom de la playlist'
							value={playlistName}
							onChangeText={handleNameChange}
						/>
					</View>

					<View style={styles.sectionSpacing}>
						<ScrollView
							horizontal
							contentContainerStyle={styles.colorsContainer}
							showsHorizontalScrollIndicator={false}>
							{colorArray.map((color) => (
								<View key={color} style={styles.optionWrapper}>
									<Pressable
										style={[styles.colorContainer, { backgroundColor: color }]}
										onPress={() => handleSelectColor(color)}
									/>
									<View
										style={[
											styles.selectionIndicator,
											{
												backgroundColor:
													selectedColor === color
														? colorBlack
														: primaryBackground,
											},
										]}
									/>
								</View>
							))}
						</ScrollView>
					</View>

					<View style={styles.sectionSpacing}>
						<ScrollView
							horizontal
							contentContainerStyle={styles.colorsContainer}
							showsHorizontalScrollIndicator={false}>
							{IMAGE_OPTIONS.map((icon) => (
								<View key={icon.name} style={styles.optionWrapper}>
									<Pressable onPress={() => handleSelectColor(icon.name)}>
										<Image source={icon.image} style={styles.colorContainer} />
									</Pressable>
									<View
										style={[
											styles.selectionIndicator,
											{
												backgroundColor:
													selectedColor === icon.name
														? colorBlack
														: primaryBackground,
											},
										]}
									/>
								</View>
							))}
						</ScrollView>
					</View>

					<View style={[styles.sectionSpacing, styles.buttonContainer]}>
						<TouchableOpacity style={styles.button} onPress={handleSubmit}>
							<Text style={styles.buttonText}>
								{hasPlaylist ? "Valider" : "Créer"}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
};

const styles = StyleSheet.create({
	sheetBackground: {
		backgroundColor: primaryBackground,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	hiddenIndicator: {
		opacity: 0,
		height: 0,
	},
	scrollContent: {
		paddingHorizontal: 20,
		paddingBottom: 24,
	},
	sheetInner: {
		paddingTop: 12,
	},
	sectionSpacing: {
		marginTop: 20,
	},
	title: {
		fontSize: FontSize18,
		fontWeight: "bold",
		textAlign: "center",
	},
	input: {
		backgroundColor: colorWhite,
		borderRadius: 50,
		padding: 12,
	},
	inputError: {
		borderWidth: 1,
		borderColor: colorRed,
	},
	colorsContainer: {
		paddingVertical: 5,
		paddingBottom: 12,
	},
	optionWrapper: {
		justifyContent: "flex-start",
		marginRight: 10,
	},
	colorContainer: {
		width: 40,
		height: 40,
		borderRadius: 40,
		borderColor: colorBlack,
		borderWidth: 1,
	},
	selectionIndicator: {
		marginTop: 6,
		marginLeft: 8,
		width: 26,
		minHeight: 4,
		borderRadius: 2,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "center",
	},
	button: {
		backgroundColor: colorBlack,
		paddingHorizontal: 30,
		paddingVertical: 10,
		borderRadius: 50,
	},
	buttonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});

export default NewPlaylistModal;
