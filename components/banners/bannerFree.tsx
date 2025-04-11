import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { FC, useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";

interface BannerFreeProps {
	onDismiss?: () => void;
}

const BANNER_CLOSED_TIME_KEY = "BANNER_CLOSED_TIME";
const CACHE_TIME = 2 * 60 * 1000; // 2 minutes for testing

const BannerFree: FC<BannerFreeProps> = ({ onDismiss }) => {
	const insets = useSafeAreaInsets();
	const [visible, setVisible] = useState<boolean>(false);

	useEffect(() => {
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
					setVisible(false);
				} else {
					setVisible(true);
				}
			} catch (error) {
				console.error("Error reading banner close time:", error);
				setVisible(true);
			}
		};

		checkBannerVisibility();
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
			<Text style={styles.message}>This is your banner message</Text>
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
