import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

interface BannerFreeProps {
	onDismiss?: () => void;
}

const BANNER_CLOSED_TIME_KEY = "BANNER_CLOSED_TIME";
// For production, change this value if needed.
const CACHE_TIME = 60 * 24 * 7 * 1000;

const BannerFree: FC<BannerFreeProps> = ({ onDismiss }) => {
	const insets = useSafeAreaInsets();
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
		let timeoutId: ReturnType<typeof setTimeout> | null = null;

		const checkBannerVisibility = async (): Promise<void> => {
			try {
				const storedTimeString = await AsyncStorage.getItem(
					BANNER_CLOSED_TIME_KEY
				);
				const storedTime: number | null = storedTimeString
					? parseInt(storedTimeString, 10)
					: null;
				const currentTime: number = new Date().getTime();

				if (storedTime && currentTime - storedTime < CACHE_TIME) {
					// Calculate the remaining time until the banner should reappear.
					const delay = CACHE_TIME - (currentTime - storedTime);
					// Hide the banner for now...
					setVisible(false);
					// ...but schedule it to show again after the remaining delay.
					timeoutId = setTimeout(() => {
						setVisible(true);
					}, delay);
				} else {
					setVisible(true);
				}
			} catch (error) {
				console.error("Error reading banner close time:", error);
				setVisible(true);
			}
		};

		checkBannerVisibility();

		// Cleanup the timeout when the component unmounts or before rerunning effect.
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	}, []);

	const handleClose = async (): Promise<void> => {
		const currentTime: number = new Date().getTime();
		try {
			await AsyncStorage.setItem(
				BANNER_CLOSED_TIME_KEY,
				currentTime.toString()
			);
		} catch (error) {
			console.error("Error saving banner close time:", error);
		}
		setVisible(false);
		if (onDismiss) {
			onDismiss();
		}
	};

	if (!visible) {
		return null;
	}

	return (
		<View style={[styles.bannerContainer, { paddingTop: insets.top }]}>
			<Text style={styles.message}>
				💥 Oui, c’est gratuit. Oui, c’est fou. En novembre, ça redeviendra
				normal. En mieux mais en payant.
			</Text>
			<TouchableOpacity onPress={handleClose} style={styles.iconButton}>
				<Ionicons name='close-circle' size={32} color='#000' />
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	bannerContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(233, 196, 0, 0.96)",
		padding: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 3 },
		shadowOpacity: 0.3,
		shadowRadius: 4.65,
		elevation: 6,
	},
	message: {
		fontWeight: "bold",
		fontSize: 16,
		flex: 1,
	},
	iconButton: {
		paddingLeft: 10,
	},
});

export default BannerFree;
