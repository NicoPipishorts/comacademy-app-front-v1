import React, { useEffect, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { clearLogs, LogEntry, subscribeLogs } from "@/logging/logStore";

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

	useEffect(() => {
		const unsubscribe = subscribeLogs((entries) => {
			setLogs(entries);
		});
		return unsubscribe;
	}, []);

	const latestLogs = logs.slice(-MAX_PREVIEW_LOGS).reverse();
	const copyLogsToClipboard = async () => {
		const payload =
			latestLogs.length > 0
				? latestLogs
						.map((entry) => formatLogEntry(entry))
						.reverse()
						.join("\n")
				: "No logs available.";
		try {
			await Clipboard.setStringAsync(payload);
			Alert.alert("Logs copied", "The most recent log entries are on your clipboard.");
		} catch (error) {
			Alert.alert("Copy failed", "Unable to copy logs.");
		}
	};

	if (!visible) {
		return (
			<Pressable
				style={[
					styles.floatingButton,
					{ bottom: insets.bottom + 20, right: 20 },
				]}
				onPress={() => setVisible(true)}>
				<Text style={styles.floatingLabel}>Logs</Text>
			</Pressable>
		);
	}

	return (
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
								onPress={() => setVisible(false)}>
								<Text style={styles.actionLabel}>Close</Text>
							</Pressable>
						</View>
					</View>
					<ScrollView style={styles.sheetBody}>
						{latestLogs.length === 0 && (
							<Text style={styles.emptyText}>No logs yet.</Text>
						)}
						{latestLogs.map((entry) => (
							<View key={entry.id} style={styles.logRow}>
								<Text style={styles.logText}>{formatLogEntry(entry)}</Text>
							</View>
						))}
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "flex-end",
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
