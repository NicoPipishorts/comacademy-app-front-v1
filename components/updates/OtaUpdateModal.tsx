import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Updates from "expo-updates";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	AppState,
	Modal,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

import {
	colorBlack,
	colorDarkGrey,
	colorGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";

type UpdateHistoryEntry = {
	updateId: string;
	channel: string;
	runtimeVersion: string;
	createdAt: string | null;
	checkedAt: string;
	isEmbeddedLaunch: boolean;
};

type AvailableUpdateDetails = UpdateHistoryEntry & {
	message?: string | null;
};

const HISTORY_STORAGE_KEY = "ota-update-history-v1";
const DISMISSED_UPDATE_STORAGE_KEY = "ota-update-dismissed-v1";
const MAX_HISTORY_ITEMS = 12;
const STARTUP_CHECK_DELAY_MS = 15000;

const getManifestRecord = (): Record<string, any> | null => {
	const manifest = (Updates as any).manifest ?? (Updates as any).manifest2 ?? null;
	return manifest && typeof manifest === "object" ? manifest : null;
};

const createUpdateEntry = (): UpdateHistoryEntry | null => {
	const manifest = getManifestRecord();
	const updateId =
		typeof Updates.updateId === "string" && Updates.updateId.trim().length > 0
			? Updates.updateId.trim()
			: typeof manifest?.id === "string" && manifest.id.trim().length > 0
				? manifest.id.trim()
				: "";

	if (!updateId) return null;

	const channel =
		typeof Updates.channel === "string" && Updates.channel.trim().length > 0
			? Updates.channel.trim()
			: "unknown";
	const runtimeVersion =
		typeof Updates.runtimeVersion === "string" &&
		Updates.runtimeVersion.trim().length > 0
			? Updates.runtimeVersion.trim()
			: "unknown";
	const createdAt =
		typeof manifest?.createdAt === "string" && manifest.createdAt.trim().length > 0
			? manifest.createdAt
			: null;

	return {
		updateId,
		channel,
		runtimeVersion,
		createdAt,
		checkedAt: new Date().toISOString(),
		isEmbeddedLaunch: Boolean((Updates as any).isEmbeddedLaunch),
	};
};

const mergeHistory = (
	existing: UpdateHistoryEntry[],
	next: UpdateHistoryEntry
): UpdateHistoryEntry[] => {
	const deduped = existing.filter((entry) => entry.updateId !== next.updateId);
	return [next, ...deduped].slice(0, MAX_HISTORY_ITEMS);
};

const formatDateTime = (value?: string | null) => {
	if (!value) return "Unknown";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleString();
};

export default function OtaUpdateModal() {
	const [visible, setVisible] = useState(false);
	const [isApplying, setIsApplying] = useState(false);
	const [availableUpdate, setAvailableUpdate] = useState<AvailableUpdateDetails | null>(null);
	const [history, setHistory] = useState<UpdateHistoryEntry[]>([]);

	const persistRunningUpdate = useCallback(async () => {
		const current = createUpdateEntry();
		if (!current) return;

		try {
			const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
			const parsed = raw ? (JSON.parse(raw) as UpdateHistoryEntry[]) : [];
			const nextHistory = mergeHistory(Array.isArray(parsed) ? parsed : [], current);
			await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(nextHistory));
			setHistory(nextHistory);
		} catch {
			setHistory((prev) => mergeHistory(prev, current));
		}
	}, []);

	const loadHistory = useCallback(async () => {
		try {
			const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
			if (!raw) {
				setHistory([]);
				return;
			}
			const parsed = JSON.parse(raw) as UpdateHistoryEntry[];
			setHistory(Array.isArray(parsed) ? parsed : []);
		} catch {
			setHistory([]);
		}
	}, []);

	const checkForUpdates = useCallback(async () => {
		if (__DEV__ || Platform.OS === "web") {
			return;
		}

		try {
			const result = await Updates.checkForUpdateAsync();
			if (!result.isAvailable) {
				return;
			}
			const current = createUpdateEntry();
			const currentUpdateId = current?.updateId ?? "";
			const dismissedId = await AsyncStorage.getItem(DISMISSED_UPDATE_STORAGE_KEY);
			if (dismissedId && dismissedId === currentUpdateId) {
				return;
			}

			setAvailableUpdate({
				updateId: "pending-download",
				channel:
					typeof Updates.channel === "string" && Updates.channel.trim().length > 0
						? Updates.channel.trim()
						: "unknown",
				runtimeVersion:
					typeof Updates.runtimeVersion === "string" &&
					Updates.runtimeVersion.trim().length > 0
						? Updates.runtimeVersion.trim()
						: "unknown",
				createdAt: null,
				checkedAt: new Date().toISOString(),
				isEmbeddedLaunch: false,
				message: null,
			});
			setVisible(true);
		} catch {
			// Silent fail: updates should never block app usage.
		}
	}, []);

	useEffect(() => {
		void loadHistory();
		void persistRunningUpdate();
	}, [checkForUpdates, loadHistory, persistRunningUpdate]);

	useEffect(() => {
		if (__DEV__ || Platform.OS === "web") {
			return;
		}

		let cancelled = false;
		let timer: ReturnType<typeof setTimeout> | null = null;

		const scheduleCheck = () => {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				if (!cancelled && AppState.currentState === "active") {
					void checkForUpdates();
				}
			}, STARTUP_CHECK_DELAY_MS);
		};

		scheduleCheck();

		const subscription = AppState.addEventListener("change", (state) => {
			if (state === "active") {
				scheduleCheck();
			}
		});

		return () => {
			cancelled = true;
			if (timer) clearTimeout(timer);
			subscription.remove();
		};
	}, [checkForUpdates]);

	const handleApplyUpdate = useCallback(async () => {
		try {
			setIsApplying(true);
			const fetchResult = await Updates.fetchUpdateAsync();
			const manifest = (fetchResult as any).manifest as Record<string, any> | undefined;
			const nextUpdateId =
				typeof manifest?.id === "string" && manifest.id.trim().length > 0
					? manifest.id.trim()
					: null;
			if (nextUpdateId) {
				await AsyncStorage.removeItem(DISMISSED_UPDATE_STORAGE_KEY);
			}
			await Updates.reloadAsync();
		} catch {
			setIsApplying(false);
		}
	}, []);

	const handleClose = useCallback(async () => {
		if (availableUpdate?.updateId) {
			await AsyncStorage.setItem(
				DISMISSED_UPDATE_STORAGE_KEY,
				availableUpdate.updateId
			);
		}
		setVisible(false);
	}, [availableUpdate?.updateId]);

	const historyItems = useMemo(() => history.slice(0, 5), [history]);

	return (
		<Modal visible={visible} animationType='fade' transparent onRequestClose={handleClose}>
			<View style={styles.backdrop}>
				<View style={styles.card}>
					<Text style={styles.title}>Mise a jour disponible</Text>
					<Text style={styles.body}>
						Une nouvelle version OTA est prete a etre appliquee.
					</Text>

					{availableUpdate ? (
						<View style={styles.detailsBlock}>
							{availableUpdate.message ? (
								<Text style={styles.message}>{availableUpdate.message}</Text>
							) : null}
							<Text style={styles.meta}>Channel: {availableUpdate.channel}</Text>
							<Text style={styles.meta}>Runtime: {availableUpdate.runtimeVersion}</Text>
							<Text style={styles.meta}>Update ID: {availableUpdate.updateId}</Text>
							<Text style={styles.meta}>
								Published: {formatDateTime(availableUpdate.createdAt)}
							</Text>
							<Text style={styles.meta}>
								Fetched: {formatDateTime(availableUpdate.checkedAt)}
							</Text>
							<Text style={styles.meta}>
								Telechargement: au clic sur "Mettre a jour"
							</Text>
						</View>
					) : null}

					<View style={styles.historyBlock}>
						<Text style={styles.historyTitle}>Historique applique</Text>
						<ScrollView
							style={styles.historyList}
							contentContainerStyle={styles.historyListContent}
							showsVerticalScrollIndicator={false}>
							{historyItems.length === 0 ? (
								<Text style={styles.emptyText}>Aucun historique OTA enregistre.</Text>
							) : (
								historyItems.map((entry) => (
									<View key={entry.updateId} style={styles.historyRow}>
										<Text style={styles.historyMain}>{entry.updateId}</Text>
										<Text style={styles.historyMeta}>
											{entry.channel} | {entry.runtimeVersion}
										</Text>
										<Text style={styles.historyMeta}>
											Applied: {formatDateTime(entry.checkedAt)}
										</Text>
										<Text style={styles.historyMeta}>
											Published: {formatDateTime(entry.createdAt)}
										</Text>
									</View>
								))
							)}
						</ScrollView>
					</View>

					<View style={styles.actions}>
						<Pressable style={styles.secondaryButton} onPress={handleClose}>
							<Text style={styles.secondaryButtonText}>Plus tard</Text>
						</Pressable>
						<Pressable
							style={[styles.primaryButton, isApplying && styles.primaryButtonDisabled]}
							onPress={handleApplyUpdate}
							disabled={isApplying}>
							{isApplying ? (
								<ActivityIndicator color={colorWhite} />
							) : (
								<Text style={styles.primaryButtonText}>Mettre a jour</Text>
							)}
						</Pressable>
					</View>
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	backdrop: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.45)",
		justifyContent: "center",
		paddingHorizontal: 20,
	},
	card: {
		maxHeight: "82%",
		borderRadius: 24,
		backgroundColor: primaryBackground,
		padding: 20,
	},
	title: {
		fontSize: 22,
		fontWeight: "700",
		color: colorBlack,
		marginBottom: 10,
	},
	body: {
		fontSize: 15,
		lineHeight: 22,
		color: colorDarkGrey,
		marginBottom: 16,
	},
	message: {
		fontSize: 15,
		fontWeight: "700",
		color: colorBlack,
		marginBottom: 10,
	},
	detailsBlock: {
		borderRadius: 16,
		backgroundColor: colorWhite,
		padding: 14,
		marginBottom: 16,
	},
	meta: {
		fontSize: 12,
		lineHeight: 18,
		color: colorDarkGrey,
	},
	historyBlock: {
		borderTopWidth: 1,
		borderTopColor: colorGrey,
		paddingTop: 14,
		marginBottom: 18,
	},
	historyTitle: {
		fontSize: 15,
		fontWeight: "700",
		color: colorBlack,
		marginBottom: 10,
	},
	historyList: {
		maxHeight: 180,
	},
	historyListContent: {
		paddingBottom: 4,
	},
	historyRow: {
		paddingVertical: 10,
		borderBottomWidth: 1,
		borderBottomColor: colorGrey,
	},
	historyMain: {
		fontSize: 12,
		fontWeight: "700",
		color: colorBlack,
		marginBottom: 2,
	},
	historyMeta: {
		fontSize: 11,
		lineHeight: 16,
		color: colorDarkGrey,
	},
	emptyText: {
		fontSize: 12,
		color: colorDarkGrey,
	},
	actions: {
		flexDirection: "row",
		gap: 10,
	},
	secondaryButton: {
		flex: 1,
		borderWidth: 1,
		borderColor: colorBlack,
		borderRadius: 14,
		paddingVertical: 14,
		alignItems: "center",
	},
	secondaryButtonText: {
		color: colorBlack,
		fontWeight: "700",
	},
	primaryButton: {
		flex: 1,
		backgroundColor: colorBlack,
		borderRadius: 14,
		paddingVertical: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	primaryButtonDisabled: {
		opacity: 0.8,
	},
	primaryButtonText: {
		color: colorWhite,
		fontWeight: "700",
	},
});
