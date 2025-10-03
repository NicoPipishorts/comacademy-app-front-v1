import { primaryBackground } from "@/constants/colors";
import { FontSize16, FontSize18 } from "@/constants/fontsizes";
import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import ModalGestureLine from "../experience/modalGestureLine";

interface Props {
	visible: boolean;
	onClose: () => void;
	message?: string;
}

const SNAP_POINTS = ["40%"];

export default function UpgradeSubscriptionModal({
	visible,
	onClose,
	message = "Cette fonctionnalité est réservée aux membres premium. Passez à un abonnement premium pour débloquer tout le contenu.",
}: Props) {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => SNAP_POINTS, []);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior="close"
			/>
		),
		[]
	);

	useEffect(() => {
		if (visible) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [visible]);

	const handleDismiss = useCallback(() => {
		onClose();
	}, [onClose]);

	const handleUpgradePress = useCallback(() => {
		// TODO: Navigate to subscription/payment page
		// navigation.navigate("subscription");
		onClose();
	}, [onClose]);

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
			<BottomSheetView style={styles.contentContainer}>
				<ModalGestureLine />
				<View style={styles.content}>
					<Text style={styles.title}>Abonnement Premium requis</Text>
					<Text style={styles.message}>{message}</Text>
					<TouchableOpacity
						style={styles.upgradeButton}
						onPress={handleUpgradePress}>
						<Text style={styles.upgradeButtonText}>
							Passer à Premium
						</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.cancelButton} onPress={onClose}>
						<Text style={styles.cancelButtonText}>Plus tard</Text>
					</TouchableOpacity>
				</View>
			</BottomSheetView>
		</BottomSheetModal>
	);
}

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
	contentContainer: {
		flex: 1,
		paddingHorizontal: 20,
		paddingBottom: 24,
	},
	content: {
		flex: 1,
		gap: 16,
		paddingTop: 12,
	},
	title: {
		fontSize: FontSize18,
		fontWeight: "bold",
		textAlign: "center",
		marginTop: 10,
	},
	message: {
		fontSize: FontSize16,
		textAlign: "center",
		lineHeight: 24,
		paddingHorizontal: 10,
	},
	upgradeButton: {
		backgroundColor: "#007AFF",
		paddingVertical: 14,
		paddingHorizontal: 24,
		borderRadius: 12,
		marginTop: 20,
		alignItems: "center",
	},
	upgradeButtonText: {
		color: "#FFFFFF",
		fontSize: FontSize16,
		fontWeight: "bold",
	},
	cancelButton: {
		paddingVertical: 12,
		paddingHorizontal: 24,
		alignItems: "center",
	},
	cancelButtonText: {
		color: "#666666",
		fontSize: FontSize16,
	},
});
