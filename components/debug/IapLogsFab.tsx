import BlurBackdrop from "@/components/experience/backdropComponent";
import ModalGestureLine from "@/components/experience/modalGestureLine";
import {
	colorBlack,
	colorDarkGrey,
	colorGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import {
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { __iapLogs } from "@/src/utils/debug";

const SNAP_POINTS = ["45%", "85%"];

const IapLogsFab: React.FC = () => {
	const insets = useSafeAreaInsets();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => SNAP_POINTS, []);
	const [logs, setLogs] = useState<string[]>([]);

	const refreshLogs = useCallback(() => {
		setLogs([...__iapLogs]);
	}, []);

	const openLogs = useCallback(() => {
		refreshLogs();
		bottomSheetRef.current?.present();
	}, [refreshLogs]);

	const handleCopy = useCallback(async () => {
		const payload =
			logs.length > 0 ? logs.join("\n") : "No purchase logs captured yet.";
		try {
			await Clipboard.setStringAsync(payload);
			Alert.alert("Logs copiés", "Les logs IAP ont été copiés.");
		} catch {
			Alert.alert("Erreur", "Impossible de copier les logs.");
		}
	}, [logs]);

	return (
		<>
			<Pressable
				style={[styles.floatingButton, { bottom: insets.bottom + 78 }]}
				onPress={openLogs}
			>
				<Text style={styles.floatingButtonLabel}>IAP Logs</Text>
			</Pressable>

			<BottomSheetModal
				ref={bottomSheetRef}
				index={0}
				snapPoints={snapPoints}
				backdropComponent={(props) => <BlurBackdrop {...props} />}
				enablePanDownToClose
				enableDynamicSizing={false}
				handleIndicatorStyle={styles.hiddenIndicator}
				backgroundStyle={styles.sheetBackground}
			>
				<BottomSheetView style={styles.sheetContainer}>
					<ModalGestureLine />
					<View style={styles.headerRow}>
						<Text style={styles.sheetTitle}>Logs Achats</Text>
						<Text style={styles.logCount}>{logs.length} entrées</Text>
					</View>

					<View style={styles.actionsRow}>
						<TouchableOpacity style={styles.secondaryButton} onPress={refreshLogs}>
							<Text style={styles.secondaryButtonText}>Rafraîchir</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.primaryButton} onPress={handleCopy}>
							<Text style={styles.primaryButtonText}>Copier</Text>
						</TouchableOpacity>
					</View>

					<BottomSheetScrollView
						style={styles.scrollView}
						contentContainerStyle={styles.scrollContent}
						nestedScrollEnabled
						keyboardShouldPersistTaps='handled'
						showsVerticalScrollIndicator
					>
						{logs.length === 0 ? (
							<Text style={styles.emptyText}>
								Aucun log achat pour le moment.
							</Text>
						) : (
							logs.map((line, index) => (
								<View key={`${index}-${line.slice(0, 24)}`} style={styles.logRow}>
									<Text style={styles.logText} selectable>
										{line}
									</Text>
								</View>
							))
						)}
					</BottomSheetScrollView>
				</BottomSheetView>
			</BottomSheetModal>
		</>
	);
};

const styles = StyleSheet.create({
	floatingButton: {
		position: "absolute",
		right: 16,
		zIndex: 99999,
		elevation: 99999,
		backgroundColor: colorBlack,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 999,
	},
	floatingButtonLabel: {
		color: colorWhite,
		fontSize: 12,
		fontWeight: "700",
	},
	sheetBackground: {
		backgroundColor: primaryBackground,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
	},
	hiddenIndicator: {
		opacity: 0,
		height: 0,
	},
	sheetContainer: {
		flex: 1,
		paddingHorizontal: 16,
		paddingBottom: 18,
	},
	headerRow: {
		marginTop: 8,
		marginBottom: 10,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	sheetTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: colorBlack,
	},
	logCount: {
		fontSize: 12,
		color: colorDarkGrey,
	},
	scrollView: {
		flex: 1,
	},
	scrollContent: {
		paddingBottom: 20,
	},
	emptyText: {
		color: colorDarkGrey,
		fontSize: 13,
		textAlign: "center",
		marginTop: 24,
	},
	logRow: {
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: colorGrey,
	},
	logText: {
		color: colorBlack,
		fontSize: 12,
		lineHeight: 18,
	},
	actionsRow: {
		marginBottom: 12,
		flexDirection: "row",
		justifyContent: "space-between",
		gap: 10,
	},
	secondaryButton: {
		flex: 1,
		borderWidth: 1,
		borderColor: colorBlack,
		borderRadius: 10,
		paddingVertical: 10,
		alignItems: "center",
	},
	secondaryButtonText: {
		color: colorBlack,
		fontWeight: "600",
	},
	primaryButton: {
		flex: 1,
		backgroundColor: colorBlack,
		borderRadius: 10,
		paddingVertical: 10,
		alignItems: "center",
	},
	primaryButtonText: {
		color: colorWhite,
		fontWeight: "700",
	},
});

export default IapLogsFab;
