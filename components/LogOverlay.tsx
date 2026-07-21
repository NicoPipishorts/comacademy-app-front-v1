import React, { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, Share, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { clearLogs, ensureLogsHydrated, LogEntry, subscribeLogs } from "@/logging/logStore";

const MAX_PREVIEW_LOGS = 25;

const formatLogEntry = (entry: LogEntry): string => {
	return `${new Date(entry.timestamp).toLocaleTimeString([], {
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
	})} · ${entry.message}`;
};

const LogOverlay: React.FC = () => {
	const insets = useSafeAreaInsets();
	const [visible, setVisible] = useState(false);
	const [logs, setLogs] = useState<LogEntry[]>([]);
	const [exportStatus, setExportStatus] = useState<string | null>(null);

	useEffect(() => {
		void ensureLogsHydrated();
		const unsubscribe = subscribeLogs((entries) => {
			setLogs(entries);
		});
		return unsubscribe;
	}, []);

	const latestLogs = logs.slice(-MAX_PREVIEW_LOGS).reverse();
	const getLogPayload = () =>
			latestLogs.length > 0
				? latestLogs
						.map((entry) => formatLogEntry(entry))
						.reverse()
						.join("\n")
				: "No logs available.";

	const copyLogsToClipboard = async () => {
		const payload = getLogPayload();
		try {
			await Clipboard.setStringAsync(payload);
			setExportStatus(`${latestLogs.length} log(s) copied to the clipboard.`);
		} catch {
			setExportStatus("Copy failed. Use Share or select the log text below.");
		}
	};

	const shareLogs = async () => {
		try {
			await Share.share({ message: getLogPayload(), title: "Com'Academy logs" });
			setExportStatus("Log share sheet opened.");
		} catch {
			setExportStatus("Share failed. Select the log text below instead.");
		}
	};

	if (!visible) {
		return (
			<Portal>
				<View pointerEvents='box-none' style={styles.portalContainer}>
					<Pressable
						style={[
							styles.floatingButton,
							{ bottom: insets.bottom + 20, right: 20 },
						]}
						onPress={() => setVisible(true)}>
						<Text style={styles.floatingLabel}>Logs</Text>
					</Pressable>
				</View>
			</Portal>
		);
	}

	return (
		<Portal>
			<Modal visible={visible} animationType='slide' transparent>
				<View style={styles.backdrop}>
					<View style={[styles.sheet, { paddingBottom: insets.bottom + 20 }]}>
						<View style={styles.sheetHeader}>
							<Text style={styles.title}>Device Logs</Text>
							<View style={styles.sheetHeaderActions}>
								<Pressable
									style={styles.actionButton}
									onPress={() => clearLogs()}>
									<Text style={styles.actionLabel}>Clear</Text>
								</Pressable>
								<Pressable
									style={[styles.actionButton, styles.actionButtonSpacing]}
									onPress={copyLogsToClipboard}>
									<Text style={styles.actionLabel}>Copy</Text>
								</Pressable>
								<Pressable
									style={[styles.actionButton, styles.actionButtonSpacing]}
									onPress={shareLogs}>
									<Text style={styles.actionLabel}>Share</Text>
								</Pressable>
								<Pressable
									style={[styles.actionButton, styles.actionButtonSpacing]}
									onPress={() => setVisible(false)}>
									<Text style={styles.actionLabel}>Close</Text>
								</Pressable>
							</View>
						</View>
						<Text style={styles.helperText}>
							Les logs sont conserves apres redemarrage pour aider au diagnostic des crashs.
						</Text>
						{exportStatus ? (
							<Text selectable style={styles.exportStatus}>{exportStatus}</Text>
						) : null}
						<ScrollView style={styles.sheetBody}>
							{latestLogs.length === 0 && (
								<Text style={styles.emptyText}>No logs yet.</Text>
							)}
							{latestLogs.map((entry, index) => (
								<View
									key={`${entry.id}-${entry.timestamp}-${index}`}
									style={styles.logRow}>
									<Text selectable style={styles.logText}>{formatLogEntry(entry)}</Text>
								</View>
							))}
						</ScrollView>
					</View>
				</View>
			</Modal>
		</Portal>
	);
};

const styles = StyleSheet.create({
backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
	},
	portalContainer: {
		...StyleSheet.absoluteFillObject,
	},
	sheet: {
		maxHeight: "80%",
		backgroundColor: "#111",
		borderTopLeftRadius: 16,
		borderTopRightRadius: 16,
		padding: 16,
	},
	sheetHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	sheetHeaderActions: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "flex-end",
	},
	title: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
	},
	actionButton: {
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
		backgroundColor: "rgba(255,255,255,0.15)",
	},
	actionButtonSpacing: {
		marginLeft: 12,
	},
	actionLabel: {
		color: "#fff",
		fontWeight: "600",
	},
	sheetBody: {
		paddingVertical: 8,
	},
	helperText: {
		color: "#bbb",
		fontSize: 12,
		lineHeight: 18,
		marginBottom: 6,
	},
	exportStatus: {
		color: "#8BE39A",
		fontSize: 12,
		lineHeight: 18,
		marginBottom: 4,
	},
	emptyText: {
		color: "#ccc",
		textAlign: "center",
		marginTop: 20,
	},
	logRow: {
		paddingVertical: 6,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(255,255,255,0.1)",
	},
	logText: {
		color: "#fff",
		fontSize: 12,
		lineHeight: 18,
	},
	floatingButton: {
		position: "absolute",
		right: 20,
		zIndex: 99999,
		elevation: 99999,
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "rgba(0,0,0,0.7)",
	},
	floatingLabel: {
		color: "#fff",
		fontWeight: "bold",
	},
});

export default LogOverlay;
