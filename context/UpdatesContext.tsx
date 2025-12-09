import BlurBackdrop from "@/components/experience/backdropComponent";
import ModalGestureLine from "@/components/experience/modalGestureLine";
import {
	colorBlack,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
import { FontSize16, FontSize18 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import { BottomSheetModal, BottomSheetView } from "@gorhom/bottom-sheet";
import * as Updates from "expo-updates";
import { useUpdates } from "expo-updates";
import type { UpdateInfoNew } from "expo-updates/build/UseUpdates.types";
import React, {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	AppState,
	type AppStateStatus,
	Platform,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import appPackage from "../package.json";

type StaticUpdateCopy = {
	versionTag: string;
	snackbarMessage: string;
	title: string;
	subtitle: string;
	primaryCtaLabel: string;
	secondaryCtaLabel: string;
	notes: string[];
};

// Centralised copy block so you can tweak messaging/version without digging into logic.
const UPDATE_COPY: StaticUpdateCopy = {
	versionTag: appPackage?.version ? `v${appPackage.version}` : "1.2.17",
	snackbarMessage: "Nouvelle mise à jour OTA. Touchez pour voir ce qui change.",
	title: "Nouveau contenu dispo",
	subtitle: "Découvrez les nouveautés et correctifs clés",
	primaryCtaLabel: "Redémarrer et mettre à jour",
	secondaryCtaLabel: "Plus tard",
	notes: [
		"Added login logs",
		"Added cpoy logs button",
		"Updated Strapi V4 to V5.",
		"instealled new debugging tools.",
	],
};

type UpdatesContextValue = {
	checkForUpdates: (options?: { force?: boolean }) => Promise<void>;
	openUpdateDetails: () => void;
	dismissUpdateNotice: () => void;
	hasPendingUpdate: boolean;
	isChecking: boolean;
	isDownloading: boolean;
	latestUpdate?: UpdateInfoNew;
};

const UpdatesContext = createContext<UpdatesContextValue>({
	checkForUpdates: async () => {},
	openUpdateDetails: () => {},
	dismissUpdateNotice: () => {},
	hasPendingUpdate: false,
	isChecking: false,
	isDownloading: false,
	latestUpdate: undefined,
});

const MIN_CHECK_INTERVAL_MS = 5 * 60 * 1000;

type UpdatesProviderProps = {
	children: ReactNode;
};

const extractReleaseNotes = (
	update?:
		| UpdateInfoNew
		| Updates.UpdateInfo
		| Updates.CurrentlyRunningInfo
		| null
) => {
	if (!update) return undefined;

	const manifest: Record<string, any> | undefined =
		update.manifest as unknown as Record<string, any> | undefined;
	if (!manifest) return undefined;

	const candidates = [
		manifest?.extra?.releaseNotes,
		manifest?.extra?.expoClient?.releaseNotes,
		manifest?.extra?.expoClient?.updates?.message,
		manifest?.extra?.expoClient?.eas?.message,
		manifest?.extra?.eas?.message,
		manifest?.metadata?.releaseNotes,
		manifest?.metadata?.message,
		manifest?.releaseNotes,
	];

	for (const maybeMessage of candidates) {
		if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
			return maybeMessage.trim();
		}
	}

	return undefined;
};

const serializeError = (error: unknown): string => {
	if (!error) return "unknown";
	if (error instanceof Error) {
		return `${error.name}:${error.message}`;
	}
	if (typeof error === "string") {
		return error;
	}
	try {
		return JSON.stringify(error);
	} catch {
		return String(error);
	}
};

const parseVersionFromString = (value?: string) => {
	if (!value) return undefined;
	const match = value.match(/v?(\d+\.\d+\.\d+)/i);
	return match ? match[1] : undefined;
};

const extractVersionFromUpdate = (
	update?:
		| Updates.UpdateInfoNew
		| Updates.UpdateInfo
		| Updates.CurrentlyRunningInfo
		| null
) => {
	const manifest = update?.manifest as Record<string, any> | undefined;
	const runtimeFromUpdate =
		update &&
		"runtimeVersion" in update &&
		typeof (update as { runtimeVersion?: string }).runtimeVersion === "string"
			? (update as { runtimeVersion?: string }).runtimeVersion
			: undefined;

	const candidates: (string | undefined)[] = [
		manifest?.version,
		manifest?.extra?.expoClient?.version,
		manifest?.extra?.eas?.appVersion,
		manifest?.metadata?.version,
		manifest?.metadata?.appVersion,
		runtimeFromUpdate,
		manifest?.runtimeVersion,
		manifest?.extra?.expoClient?.runtimeVersion,
		manifest?.metadata?.runtimeVersion,
	];

	for (const candidate of candidates) {
		if (typeof candidate === "string" && candidate.trim().length > 0) {
			return candidate;
		}
	}

	const releaseNotesVersion = parseVersionFromString(
		extractReleaseNotes(update)
	);
	if (releaseNotesVersion) {
		return releaseNotesVersion;
	}

	return undefined;
};

const formatVersionTag = (version?: string) => {
	if (!version || version.trim().length === 0) {
		return UPDATE_COPY.versionTag;
	}
	return version.toLowerCase().startsWith("v") ? version : `v${version}`;
};

export const UpdatesProvider = ({ children }: UpdatesProviderProps) => {
	const {
		availableUpdate,
		downloadedUpdate,
		isUpdatePending,
		isChecking,
		isDownloading,
		checkError,
		downloadError,
		currentlyRunning,
	} = useUpdates();
	const [latestUpdate, setLatestUpdate] = useState<UpdateInfoNew | undefined>(
		undefined
	);
	const [pendingUpdate, setPendingUpdate] = useState<UpdateInfoNew | undefined>(
		undefined
	);
	const [snackbarVisible, setSnackbarVisible] = useState(false);
	const [manualCheckInFlight, setManualCheckInFlight] = useState(false);
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const lastCheckRef = useRef<number>(0);
	const lastNotifiedUpdateIdRef = useRef<string | null>(null);
	const lastCheckErrorRef = useRef<string | null>(null);
	const lastDownloadErrorRef = useRef<string | null>(null);
	const insets = useSafeAreaInsets();
	const showSnackbar = useSnackbar();
	const versionTag = useMemo(() => {
		const referenceUpdate = latestUpdate ?? pendingUpdate ?? currentlyRunning;
		const manifestVersion = extractVersionFromUpdate(referenceUpdate);
		return formatVersionTag(manifestVersion ?? appPackage?.version);
	}, [currentlyRunning, latestUpdate, pendingUpdate]);
	const snackbarMessage = useMemo(
		() => `${UPDATE_COPY.snackbarMessage} (${versionTag})`,
		[versionTag]
	);

	useEffect(() => {
		if (!lastNotifiedUpdateIdRef.current && currentlyRunning?.updateId) {
			lastNotifiedUpdateIdRef.current = currentlyRunning.updateId;
		}
	}, [currentlyRunning?.updateId]);

	const resolveUpdateId = useCallback((update: Updates.UpdateInfoNew) => {
		return (
			update.updateId ??
			(update.manifest as Record<string, any> | undefined)?.id ??
			update.createdAt?.toISOString()
		);
	}, []);

	const storePendingUpdate = useCallback((update?: Updates.UpdateInfo) => {
		if (!update || update.type !== Updates.UpdateInfoType.NEW) {
			setPendingUpdate(undefined);
			return;
		}
		setPendingUpdate(update);
	}, []);

	const storeReadyUpdate = useCallback(
		(update?: Updates.UpdateInfo) => {
			if (!update || update.type !== Updates.UpdateInfoType.NEW) {
				return;
			}

			const updateId = resolveUpdateId(update);

			if (updateId && lastNotifiedUpdateIdRef.current === updateId) {
				return;
			}

			if (updateId) {
				lastNotifiedUpdateIdRef.current = updateId;
			}

			setPendingUpdate(undefined);
			setLatestUpdate(update);
			setSnackbarVisible(true);
		},
		[resolveUpdateId]
	);

	useEffect(() => {
		storeReadyUpdate(downloadedUpdate);
	}, [downloadedUpdate, storeReadyUpdate]);

	useEffect(() => {
		storePendingUpdate(availableUpdate);
	}, [availableUpdate, storePendingUpdate]);

	const throttledCheck = useCallback(
		async (force?: boolean) => {
			if (__DEV__ || Platform.OS === "web") return;
			if (manualCheckInFlight || isChecking || isDownloading) return;

			const now = Date.now();
			if (!force && now - lastCheckRef.current < MIN_CHECK_INTERVAL_MS) {
				return;
			}
			lastCheckRef.current = now;

			try {
				setManualCheckInFlight(true);
				const result = await Updates.checkForUpdateAsync();
				if (result.isAvailable) {
					await Updates.fetchUpdateAsync();
				}
			} catch (error) {
				console.error("Failed to check for OTA updates", error);
				showSnackbar("Mise à jour indisponible pour le moment.", "error");
			} finally {
				setManualCheckInFlight(false);
			}
		},
		[isChecking, isDownloading, manualCheckInFlight, showSnackbar]
	);

	useEffect(() => {
		void throttledCheck(true);
	}, [throttledCheck]);

	useEffect(() => {
		const handleAppStateChange = (state: AppStateStatus) => {
			if (state === "active") {
				void throttledCheck(false);
			}
		};

		const subscription = AppState.addEventListener(
			"change",
			handleAppStateChange
		);

		return () => {
			subscription.remove();
		};
	}, [throttledCheck]);

	useEffect(() => {
		if (!checkError) {
			lastCheckErrorRef.current = null;
			return;
		}
		if (latestUpdate || pendingUpdate) {
			return;
		}
		const signature = serializeError(checkError);
		if (lastCheckErrorRef.current === signature) {
			return;
		}
		lastCheckErrorRef.current = signature;
		console.error("Update check error:", checkError);
		showSnackbar("Impossible de vérifier les mises à jour.", "error");
	}, [checkError, latestUpdate, pendingUpdate, showSnackbar]);

	useEffect(() => {
		if (!downloadError) {
			lastDownloadErrorRef.current = null;
			return;
		}
		const signature = serializeError(downloadError);
		if (lastDownloadErrorRef.current === signature) {
			return;
		}
		lastDownloadErrorRef.current = signature;
		console.error("Update download error:", downloadError);
		showSnackbar("Le téléchargement de la mise à jour a échoué.", "error");
	}, [downloadError, showSnackbar]);

	const openUpdateDetails = useCallback(() => {
		if (!latestUpdate && !pendingUpdate) {
			void throttledCheck(true);
			return;
		}
		setSnackbarVisible(false);
		bottomSheetRef.current?.present();
	}, [latestUpdate, pendingUpdate, throttledCheck]);

	const dismissUpdateNotice = useCallback(() => {
		setSnackbarVisible(false);
	}, []);

	const handleBottomSheetDismiss = useCallback(() => {
		// Re-display the snackbar so the user can revisit the details later.
		if (latestUpdate) {
			setSnackbarVisible(true);
		}
	}, [latestUpdate]);

	const handleApplyUpdate = useCallback(async () => {
		if (!latestUpdate) {
			try {
				setSnackbarVisible(false);
				if (!isDownloading) {
					await Updates.fetchUpdateAsync();
				}
				showSnackbar(
					"La mise à jour est en cours de téléchargement...",
					"info"
				);
			} catch (error) {
				console.error("Failed to fetch update before applying", error);
				showSnackbar("Le téléchargement de la mise à jour a échoué.", "error");
				setSnackbarVisible(true);
			} finally {
				bottomSheetRef.current?.dismiss();
			}
			return;
		}

		const previousUpdate = latestUpdate;
		try {
			setSnackbarVisible(false);
			bottomSheetRef.current?.dismiss();
			setLatestUpdate(undefined);
			await Updates.reloadAsync();
		} catch (error) {
			console.error("Failed to reload update", error);
			showSnackbar("Le redémarrage pour la mise à jour a échoué.", "error");
			setSnackbarVisible(true);
			setLatestUpdate(previousUpdate);
		}
	}, [isDownloading, latestUpdate, showSnackbar]);

	const releaseNotes = useMemo(() => {
		const referenceUpdate = latestUpdate ?? pendingUpdate;
		const manifestNotes = referenceUpdate
			? extractReleaseNotes(referenceUpdate)
			: undefined;
		return manifestNotes ?? UPDATE_COPY.notes.join("\n\n");
	}, [latestUpdate, pendingUpdate]);

	const sheetSubtitle = useMemo(() => {
		const referenceUpdate = latestUpdate ?? pendingUpdate;
		if (referenceUpdate?.createdAt) {
			return `Publiée le ${referenceUpdate.createdAt.toLocaleString()} · ${versionTag}`;
		}
		return `${UPDATE_COPY.subtitle} · ${versionTag}`;
	}, [latestUpdate, pendingUpdate, versionTag]);

	const checkForUpdates = useCallback(
		async ({ force }: { force?: boolean } = {}) => {
			await throttledCheck(force);
		},
		[throttledCheck]
	);

	const contextValue = useMemo<UpdatesContextValue>(
		() => ({
			checkForUpdates,
			openUpdateDetails,
			dismissUpdateNotice,
			hasPendingUpdate: Boolean(
				latestUpdate ?? pendingUpdate ?? isUpdatePending
			),
			isChecking: isChecking || manualCheckInFlight,
			isDownloading,
			latestUpdate,
		}),
		[
			checkForUpdates,
			openUpdateDetails,
			dismissUpdateNotice,
			latestUpdate,
			pendingUpdate,
			isUpdatePending,
			isChecking,
			manualCheckInFlight,
			isDownloading,
		]
	);

	return (
		<UpdatesContext.Provider value={contextValue}>
			{children}

			<Portal>
				{snackbarVisible && (
					<Pressable
						style={[
							styles.snackbarContainer,
							{
								bottom: insets.bottom + 24,
							},
						]}
						onPress={openUpdateDetails}>
						<View style={styles.snackbarContent}>
							<Text style={styles.snackbarTitle}>Mise à jour disponible</Text>
							<Text style={styles.snackbarMessage}>{snackbarMessage}</Text>
						</View>
					</Pressable>
				)}
			</Portal>

			<BottomSheetModal
				ref={bottomSheetRef}
				index={0}
				snapPoints={["55%"]}
				backdropComponent={(props) => <BlurBackdrop {...props} />}
				backgroundStyle={styles.sheetBackground}
				handleIndicatorStyle={styles.hiddenIndicator}
				enablePanDownToClose
				onDismiss={handleBottomSheetDismiss}>
				<BottomSheetView style={styles.sheetContent}>
					<ModalGestureLine />
					<View style={styles.sheetInner}>
						<Text style={styles.sheetTitle}>{UPDATE_COPY.title}</Text>
						<Text style={styles.sheetSubtitle}>{sheetSubtitle}</Text>
						<View style={styles.releaseNotesWrapper}>
							<Text style={styles.releaseNotes}>{releaseNotes}</Text>
						</View>
						<View style={styles.actions}>
							<Pressable
								onPress={handleApplyUpdate}
								style={[buttonBlack, styles.primaryButton]}>
								<Text style={styles.primaryButtonText}>
									{UPDATE_COPY.primaryCtaLabel}
								</Text>
							</Pressable>
							<Pressable
								onPress={() => bottomSheetRef.current?.dismiss()}
								style={styles.secondaryAction}>
								<Text style={styles.secondaryActionText}>
									{UPDATE_COPY.secondaryCtaLabel}
								</Text>
							</Pressable>
						</View>
					</View>
				</BottomSheetView>
			</BottomSheetModal>
		</UpdatesContext.Provider>
	);
};

export const useUpdatesContext = () => useContext(UpdatesContext);

const styles = StyleSheet.create({
	snackbarContainer: {
		position: "absolute",
		left: 24,
		right: 24,
		borderRadius: 16,
		backgroundColor: colorYellow,
		paddingHorizontal: 18,
		paddingVertical: 14,
		shadowColor: colorBlack,
		shadowOpacity: 0.2,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 4 },
		elevation: 6,
		zIndex: 10000,
	},
	snackbarContent: {
		gap: 4,
	},
	snackbarTitle: {
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorBlack,
	},
	snackbarMessage: {
		fontSize: FontSize16,
		color: colorBlack,
	},
	sheetBackground: {
		backgroundColor: primaryBackground,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	hiddenIndicator: {
		opacity: 0,
		height: 0,
	},
	sheetContent: {
		flex: 1,
		paddingBottom: 32,
	},
	sheetInner: {
		flex: 1,
		paddingHorizontal: 20,
		gap: 16,
	},
	sheetTitle: {
		fontSize: FontSize18,
		fontWeight: "bold",
		color: colorBlack,
		textAlign: "center",
	},
	sheetSubtitle: {
		fontSize: FontSize16,
		color: colorBlack,
		textAlign: "center",
		opacity: 0.7,
	},
	releaseNotesWrapper: {
		padding: 16,
		borderRadius: 12,
		backgroundColor: colorWhite,
	},
	releaseNotes: {
		fontSize: FontSize16,
		color: colorBlack,
		lineHeight: 22,
	},
	actions: {
		alignItems: "center",
		gap: 12,
		marginTop: "auto",
	},
	primaryButton: {
		width: "100%",
	},
	primaryButtonText: {
		color: colorWhite,
		fontWeight: "bold",
		fontSize: FontSize16,
		textAlign: "center",
	},
	secondaryAction: {
		paddingVertical: 12,
	},
	secondaryActionText: {
		fontSize: FontSize16,
		color: colorBlack,
		fontWeight: "500",
	},
});
