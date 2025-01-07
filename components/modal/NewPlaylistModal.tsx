import { primaryBackground } from "@/constants/colors";
import { FontSize12, FontSize18 } from "@/constants/fontsizes";
import React, { useRef, useState } from "react";
import {
	Animated,
	Dimensions,
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

	const showModal = () => {
		Animated.spring(slideAnim, {
			toValue: 0,
			useNativeDriver: true,
		}).start();
	};

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
	}, [visible]);

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
								<TouchableOpacity
									style={styles.cancelButton}
									onPress={hideModal}>
									<Text style={styles.buttonText}>Annuler</Text>
								</TouchableOpacity>

								<TouchableOpacity
									style={styles.createButton}
									onPress={handleSubmit}>
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
		backgroundColor: primaryBackground,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		padding: 20,
		height: Dimensions.get("window").height * 0.5,
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
		borderRadius: 8,
		padding: 12,
		marginBottom: 20,
	},
	buttonContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 10,
	},
	cancelButton: {
		flex: 1,
		backgroundColor: "#666",
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	createButton: {
		flex: 1,
		backgroundColor: primaryBackground,
		padding: 12,
		borderRadius: 8,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: FontSize12,
		fontWeight: "bold",
	},
});

export default NewPlaylistModal;
