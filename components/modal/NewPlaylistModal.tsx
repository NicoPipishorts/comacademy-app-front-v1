import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { FontSize16, FontSize18 } from "@/constants/fontsizes";
import React, { useCallback, useRef, useState } from "react";
import {
	Animated,
	Modal,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

interface NewPlaylistModalProps {
	visible: boolean;
	onClose: () => void;
	onSubmit: (name: string) => void;
}

const NewPlaylistModal = ({
	visible,
	onClose,
	onSubmit,
}: NewPlaylistModalProps) => {
	const [playlistName, setPlaylistName] = useState("");
	const slideAnim = useRef(new Animated.Value(300)).current;

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
		onSubmit(playlistName);
		setPlaylistName("");
	};

	React.useEffect(() => {
		if (visible) {
			showModal();
		}
	}, [showModal, visible]);

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
		height: 250,
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
