import BlurBackdrop from "@/components/experience/backdropComponent";
import ModalGestureLine from "@/components/experience/modalGestureLine";
import {
	colorBlack,
	colorDarkGrey,
	colorGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { LogEntry, clearLogs, subscribeLogs } from "@/logging/logStore";
import {
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SNAP_POINTS = ["45%", "85%"];

const formatTimestamp = (timestamp: string) =>
	new Date(timestamp).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

const formatEntry = (entry: LogEntry) =>
	`${formatTimestamp(entry.timestamp)} [${entry.level.toUpperCase()}] ${entry.message}`;

const isIapEntry = (entry: LogEntry) => /iap|purchase|entitlement/i.test(entry.message);

const DeviceLogsFab: React.FC = () => {
	const insets = useSafeAreaInsets();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => SNAP_POINTS, []);
	const [allLogs, setAllLogs] = useState<LogEntry[]>([]);

	useEffect(() => {
		return subscribeLogs((entries) => {
			setAllLogs(entries);
		});
	}, []);

	const logs = useMemo(
		() => allLogs.filter((entry) => !isIapEntry(entry)).reverse(),
		[allLogs]
	);

	const openLogs = useCallback(() => {
		bottomSheetRef.current?.present();
	}, []);

	const handleCopy = useCallback(async () => {
		const payload =
			logs.length > 0
				? logs
						.slice()
						.reverse()
						.map((entry) => formatEntry(entry))
						.join("\n")
				: "No device logs captured yet.";
		try {
			await Clipboard.setStringAsync(payload);
			Alert.alert("Logs copied", "Device logs have been copied.");
		} catch {
			Alert.alert("Error", "Unable to copy logs.");
		}
	}, [logs]);

	const handleClear = useCallback(() => {
		clearLogs();
	}, []);

	return (
		<>
			<Pressable
				style={[styles.floatingButton, { bottom: insets.bottom + 78 }]}
				onPress={openLogs}
			>
				<Text style={styles.floatingButtonLabel}>Logs</Text>
			</Pressable>

			<BottomSheetModal
				ref={bottomSheetRef}
				index={0}
				snapPoints={snapPoints}
				backdropComponent={(props) => <BlurBackdrop {...props} />}
				enablePanDownToClose
				enableContentPanningGesture={false}
				enableDynamicSizing={false}
				handleIndicatorStyle={styles.hiddenIndicator}
				backgroundStyle={styles.sheetBackground}
			>
				<BottomSheetView style={styles.sheetContainer}>
					<ModalGestureLine />
					<View style={styles.headerRow}>
						<Text style={styles.sheetTitle}>Device Logs</Text>
						<Text style={styles.logCount}>{logs.length} entries</Text>
					</View>

					<View style={styles.actionsRow}>
						<TouchableOpacity style={styles.secondaryButton} onPress={handleClear}>
							<Text style={styles.secondaryButtonText}>Clear</Text>
						</TouchableOpacity>
						<TouchableOpacity style={styles.primaryButton} onPress={handleCopy}>
							<Text style={styles.primaryButtonText}>Copy</Text>
						</TouchableOpacity>
					</View>

					{logs.length === 0 ? (
						<View style={styles.emptyState}>
							<Text style={styles.emptyText}>
								No non-IAP logs captured yet.
							</Text>
						</View>
					) : (
						<View style={styles.logsPanel}>
							<BottomSheetScrollView
								style={styles.list}
								contentContainerStyle={styles.listContent}
								showsVerticalScrollIndicator
								nestedScrollEnabled
								keyboardShouldPersistTaps='handled'
							>
								{logs.map((entry) => (
									<View key={entry.id} style={styles.logRow}>
										<Text style={styles.logText}>{formatEntry(entry)}</Text>
									</View>
								))}
							</BottomSheetScrollView>
						</View>
					)}
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
	list: {
		flex: 1,
	},
	logsPanel: {
		flex: 1,
		maxHeight: "85%",
	},
	listContent: {
		paddingBottom: 20,
	},
	emptyState: {
		flex: 1,
		justifyContent: "center",
	},
	emptyText: {
		color: colorDarkGrey,
		fontSize: 13,
		textAlign: "center",
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

export default DeviceLogsFab;
