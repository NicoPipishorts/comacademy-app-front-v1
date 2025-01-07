import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16, FontSize18 } from "@/constants/fontsizes";
import React, { useCallback, useRef, useState } from "react";
import {
	Animated,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { colorArray } from "../user/changeAvatar";

interface NewPlaylistModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (name: string, selectedColor: string) => void;
}

const NewPlaylistModal = ({
	visible,
	onClose,
	onSubmit,
}: NewPlaylistModalProps) => {
	const [playlistName, setPlaylistName] = useState("");
	const slideAnim = useRef(new Animated.Value(300)).current;
	const [selectedColor, setSelectedColor] = useState<string>();

	const showModal = useCallback(() => {
		Animated.spring(slideAnim, {
			toValue: 0,
			useNativeDriver: true,
		}).start();
	}, [slideAnim]);

	const hideModal = () => {
		Animated.timing(slideAnim, {
			toValue: 300,
			duration: 200,
			useNativeDriver: true,
		}).start(() => {
			onClose();
		});
	};

	const handleSubmit = () => {
		onSubmit(playlistName, selectedColor);
		setPlaylistName("");
	};

	React.useEffect(() => {
		if (visible) {
			showModal();
		}
	}, [showModal, visible]);

	const onPress = (color: string) => {
		setSelectedColor(color);
	};

	return (
		<Modal
			animationType='none'
			transparent={true}
			visible={visible}
			onRequestClose={hideModal}>
			<TouchableOpacity
				style={styles.modalOverlay}
				activeOpacity={1}
				onPress={hideModal}>
				<View style={styles.modalWrapper}>
					<Animated.View
						style={[
							styles.modalContent,
							{
								transform: [{ translateY: slideAnim }],
							},
						]}>
						<TouchableOpacity
							activeOpacity={1}
							onPress={(e) => e.stopPropagation()}>
							<Text style={styles.modalTitle}>Créer une nouvelle playlist</Text>

							<TextInput
								style={styles.input}
								placeholder='Nom de la playlist'
								value={playlistName}
								onChangeText={setPlaylistName}
							/>

							<ScrollView
								horizontal
								contentContainerStyle={styles.colorsContainer}
								showsHorizontalScrollIndicator={false}>
								{colorArray.map((color, index) => {
									return (
										<View
											key={index}
											style={{
												justifyContent: "flex-start",
												marginRight: 10,
											}}>
											<Pressable
												style={[
													styles.colorContainer,
													{ backgroundColor: color },
												]}
												onPress={() => onPress(color)}
											/>
											<View
												style={{
													marginTop: 6,
													marginLeft: 8,
													width: 26,
													minHeight: 4,
													borderRadius: 2,
													backgroundColor: selectedColor
														? selectedColor === color
															? colorBlack
															: primaryBackground
														: "",
												}}
											/>
										</View>
									);
								})}
							</ScrollView>

							<View style={styles.buttonContainer}>
								<TouchableOpacity style={styles.button} onPress={handleSubmit}>
									<Text style={styles.buttonText}>Créer</Text>
								</TouchableOpacity>
							</View>
						</TouchableOpacity>
					</Animated.View>
				</View>
			</TouchableOpacity>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0, 0, 0, 0.5)",
	},
	modalWrapper: {
		flex: 1,
		justifyContent: "flex-end",
	},
	modalContent: {
		display: "flex",
		justifyContent: "center",
		backgroundColor: primaryBackground,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		height: 320,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: -2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	modalTitle: {
		fontSize: FontSize18,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		backgroundColor: "#fff",
		borderRadius: 50,
		padding: 12,
		marginBottom: 30,
	},

	colorsContainer: {
		paddingVertical: 10,
		marginBottom: 20,
	},
	colorContainer: {
		width: 40,
		height: 40,
		borderRadius: 40,
		borderColor: colorBlack,
		borderWidth: 1,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 10,
	},
	button: {
		backgroundColor: colorBlack,
		marginBottom: 20,
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
