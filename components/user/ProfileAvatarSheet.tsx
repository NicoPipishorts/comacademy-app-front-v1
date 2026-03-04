import { useUpdateUserPreferences } from "@/api/updateUserPreferences";
import AvatarInitials from "@/components/avatars/initials";
import ModalGestureLine from "@/components/experience/modalGestureLine";
import {
	colorBlack,
	colorBlue,
	colorDarkGrey,
	colorGreen,
	colorGrey,
	colorOrange,
	colorPink,
	colorPurple,
	colorTurquoise,
	colorWhite,
	colorYellow,
	primaryBackground,
} from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
import { FontSize16, FontSize18 } from "@/constants/fontsizes";
import { logDevice } from "@/helpers/logDevice";
import {
	resolveUserPreference,
	resolveUserPreferenceAvatarUrl,
} from "@/helpers/userPreferences";
import { queryClient } from "@/hooks/reactQueryConfig";
import useAuthSession from "@/hooks/useAuthSession";
import useGetUserPreferences from "@/hooks/useGetUserPreferences";
import useJwtToken from "@/hooks/useJwtToken";
import { MaterialIcons } from "@expo/vector-icons";
import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import * as Clipboard from "expo-clipboard";
import * as ImagePicker from "expo-image-picker";
import { LogEntry, subscribeLogs } from "@/logging/logStore";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ActivityIndicator,
	Alert,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";

interface Props {
	visible: boolean;
	onClose: () => void;
}

const AVATAR_COLORS = [
	colorGreen,
	colorTurquoise,
	colorOrange,
	colorYellow,
	colorPink,
	colorPurple,
	colorBlue,
	colorGrey,
	colorDarkGrey,
	colorBlack,
];

const AVATAR_LOG_PREFIX = "[AvatarSheet]";
const AVATAR_LOG_FILTER = /\[(AvatarSheet|AvatarInitials|UserPreferences|UserScreen)\]/;

const avatarLog = (
	message: string,
	payload?: Record<string, unknown>,
	level: "info" | "warn" | "error" = "info"
) => {
	const prefixedMessage = `${AVATAR_LOG_PREFIX} ${message}`;
	logDevice(prefixedMessage, payload, level);

	if (!__DEV__) return;
	if (payload) {
		console.log(prefixedMessage, payload);
		return;
	}
	console.log(prefixedMessage);
};

const startPendingWatch = (label: string, thresholdMs = 10000) => {
	const startedAt = Date.now();
	const timer = setTimeout(() => {
		avatarLog(`${label} still pending`, {
			elapsedMs: Date.now() - startedAt,
		}, "warn");
	}, thresholdMs);

	return () => clearTimeout(timer);
};

const formatLogTimestamp = (timestamp: string) =>
	new Date(timestamp).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
	});

export default function ProfileAvatarSheet({ visible, onClose }: Props) {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ["90%"], []);
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const { data } = useGetUserPreferences(auth?.user.id);
	const updatePreferences = useUpdateUserPreferences();
	const [isUploading, setIsUploading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isCopyingLogs, setIsCopyingLogs] = useState(false);
	const [avatarLogs, setAvatarLogs] = useState<LogEntry[]>([]);

	const preference = resolveUserPreference(data);
	const selectedColor = preference?.avatarBackgroundColor || colorYellow;
	const avatarUrl = resolveUserPreferenceAvatarUrl(preference);

	useEffect(() => {
		return subscribeLogs((entries) => {
			setAvatarLogs(entries.filter((entry) => AVATAR_LOG_FILTER.test(entry.message)));
		});
	}, []);

	useEffect(() => {
		if (visible) {
			avatarLog("CTA open avatar editor", {
				userId: auth?.user?.id,
			});
			bottomSheetRef.current?.present();
		} else {
			avatarLog("request dismiss avatar editor");
			bottomSheetRef.current?.dismiss();
		}
	}, [auth?.user?.id, visible]);

	useEffect(() => {
		avatarLog("sheet state updated", {
			visible,
			hasAvatarUrl: Boolean(avatarUrl),
			selectedColor,
			isUploading,
			isDeleting,
			isUpdatePending: updatePreferences.isPending,
		});
	}, [
		avatarUrl,
		isDeleting,
		isUploading,
		selectedColor,
		updatePreferences.isPending,
		visible,
	]);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop
				{...props}
				appearsOnIndex={0}
				disappearsOnIndex={-1}
				pressBehavior='close'
			/>
		),
		[],
	);

	const copyAvatarLogs = useCallback(async () => {
		const payload =
			avatarLogs.length > 0
				? avatarLogs
						.map(
							(entry) =>
								`${formatLogTimestamp(entry.timestamp)} [${entry.level.toUpperCase()}] ${entry.message}`,
						)
						.join("\n")
				: "No avatar logs captured yet.";

		setIsCopyingLogs(true);
		try {
			await Clipboard.setStringAsync(payload);
			avatarLog("CTA copy avatar logs", {
				entryCount: avatarLogs.length,
				characterCount: payload.length,
			});
			Alert.alert(
				"Logs copiés",
				"Les logs avatar ont été copiés dans le presse-papiers.",
			);
		} catch (error) {
			avatarLog(
				"copy avatar logs failed",
				{
					error:
						error instanceof Error
							? error.message
							: "Unknown clipboard error",
				},
				"error",
			);
			Alert.alert("Erreur", "Impossible de copier les logs avatar.");
		} finally {
			setIsCopyingLogs(false);
		}
	}, [avatarLogs]);

	const updateColor = (color: string) => {
		avatarLog("CTA select avatar color", {
			nextColor: color,
			previousColor: selectedColor,
			isUpdatePending: updatePreferences.isPending,
		});
		const startedAt = Date.now();
		updatePreferences.mutate(
			{ avatarBackgroundColor: color },
			{
				onSuccess: () => {
					avatarLog("update color success", {
						color,
						elapsedMs: Date.now() - startedAt,
					});
				},
				onError: (error) => {
					avatarLog("update color failed", {
						color,
						elapsedMs: Date.now() - startedAt,
						error:
							error instanceof Error ? error.message : "Unknown mutation error",
					}, "error");
				},
				onSettled: () => {
					avatarLog("update color settled", {
						color,
						elapsedMs: Date.now() - startedAt,
					});
				},
			},
		);
	};

	const deleteAvatar = async () => {
		if (!token) {
			avatarLog("delete skipped: missing token");
			return;
		}

		try {
			setIsDeleting(true);
			const startedAt = Date.now();
			const stopWatch = startPendingWatch("delete avatar request");
			avatarLog("CTA delete avatar");
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/user-preferences/me/avatar`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);
			stopWatch();
			avatarLog("delete avatar response received", {
				status: response.status,
				ok: response.ok,
				elapsedMs: Date.now() - startedAt,
			});

			if (!response.ok) {
				const body = await response.text();
				throw new Error(
					`Delete avatar failed (${response.status}): ${body || "Unknown error"}`,
				);
			}

			await queryClient.invalidateQueries({ queryKey: ["UserPreferences"] });
			avatarLog("delete avatar success: user preferences invalidated");
		} catch (error) {
			avatarLog(
				"delete avatar error",
				{
					error:
						error instanceof Error ? error.message : "Unknown delete avatar error",
				},
				"error",
			);
			console.error("[ProfileAvatarSheet] delete avatar error:", error);
			Alert.alert(
				"Suppression impossible",
				"Impossible de supprimer l’avatar pour le moment.",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const uploadAvatar = async () => {
		if (!token) {
			avatarLog("upload skipped: missing token");
			return;
		}

		try {
			avatarLog("CTA upload avatar");
			const permissionStartedAt = Date.now();
			const permission =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			avatarLog("media permission resolved", {
				granted: permission.granted,
				elapsedMs: Date.now() - permissionStartedAt,
			});
			if (!permission.granted) {
				Alert.alert(
					"Autorisation requise",
					"Autorise l’accès aux photos pour importer un avatar.",
				);
				return;
			}

			const pickerStartedAt = Date.now();
			const pickResult = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});
			avatarLog("image picker resolved", {
				canceled: pickResult.canceled,
				assetCount: pickResult.assets?.length ?? 0,
				elapsedMs: Date.now() - pickerStartedAt,
			});

			if (pickResult.canceled || !pickResult.assets.length) {
				return;
			}

			const asset = pickResult.assets[0];
			const filename = asset.fileName || `avatar-${Date.now()}.jpg`;
			const mimeType = asset.mimeType || "image/jpeg";
			avatarLog("selected avatar asset", {
				fileName: filename,
				mimeType,
				width: asset.width ?? null,
				height: asset.height ?? null,
				fileSize: asset.fileSize ?? null,
			});

			setIsUploading(true);

			const formData = new FormData();
			formData.append("files", {
				uri: asset.uri,
				name: filename,
				type: mimeType,
			} as any);

			const uploadStartedAt = Date.now();
			const stopUploadWatch = startPendingWatch("upload file request");
			avatarLog("upload file request start");
			const uploadResponse = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/upload`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData as any,
				},
			);
			stopUploadWatch();
			avatarLog("upload file response received", {
				status: uploadResponse.status,
				ok: uploadResponse.ok,
				elapsedMs: Date.now() - uploadStartedAt,
			});

			if (!uploadResponse.ok) {
				const body = await uploadResponse.text();
				throw new Error(
					`Upload failed (${uploadResponse.status}): ${body || "Unknown error"}`,
				);
			}

			const uploadPayload = await uploadResponse.json();
			const fileData = Array.isArray(uploadPayload)
				? uploadPayload[0]
				: uploadPayload;
			const avatarFileId = Number(fileData?.id);
			avatarLog("upload payload parsed", {
				hasArrayPayload: Array.isArray(uploadPayload),
				avatarFileId,
			});

			if (!Number.isFinite(avatarFileId) || avatarFileId <= 0) {
				throw new Error("Invalid uploaded file id");
			}

			const attachStartedAt = Date.now();
			const stopAttachWatch = startPendingWatch("attach avatar request");
			avatarLog("attach avatar request start", { avatarFileId });
			const attachResponse = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/user-preferences/me/avatar`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ avatarFileId }),
				},
			);
			stopAttachWatch();
			avatarLog("attach avatar response received", {
				status: attachResponse.status,
				ok: attachResponse.ok,
				elapsedMs: Date.now() - attachStartedAt,
			});

			if (!attachResponse.ok) {
				const body = await attachResponse.text();
				throw new Error(
					`Attach avatar failed (${attachResponse.status}): ${body || "Unknown error"}`,
				);
			}

			await queryClient.invalidateQueries({ queryKey: ["UserPreferences"] });
			avatarLog("upload flow success: user preferences invalidated");
		} catch (error) {
			avatarLog(
				"upload avatar error",
				{
					error:
						error instanceof Error ? error.message : "Unknown upload avatar error",
				},
				"error",
			);
			console.error("[ProfileAvatarSheet] upload avatar error:", error);
			Alert.alert(
				"Upload impossible",
				"Impossible d’importer l’avatar pour le moment.",
			);
		} finally {
			setIsUploading(false);
		}
	};

	const onDismiss = useCallback(() => {
		avatarLog("sheet dismissed");
		onClose();
	}, [onClose]);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			index={0}
			snapPoints={snapPoints}
			enableDynamicSizing
			enablePanDownToClose
			onDismiss={onDismiss}
			backdropComponent={renderBackdrop}
			backgroundStyle={styles.sheetBackground}
			handleIndicatorStyle={styles.hiddenIndicator}>
			<BottomSheetScrollView
				style={styles.scrollArea}
				contentContainerStyle={styles.scrollContent}
				showsVerticalScrollIndicator={false}>
				<BottomSheetView style={styles.sheetContent}>
					<ModalGestureLine />
					<Text style={styles.title}>Modifier l’avatar</Text>

					<View style={styles.previewContainer}>
						<AvatarInitials
							size={92}
							showBorder
							onPress={() => undefined}
							wrapperAlignSelf='center'
						/>
						{avatarUrl ? (
							<Pressable
								onPress={deleteAvatar}
								style={styles.deleteButton}
								disabled={isDeleting || isUploading}>
								{isDeleting ? (
									<ActivityIndicator color={colorWhite} />
								) : (
									<>
										<MaterialIcons
											name='delete-outline'
											size={18}
											color={colorWhite}
										/>
										<Text style={styles.deleteButtonText}>
											Supprimer l’avatar
										</Text>
									</>
								)}
							</Pressable>
						) : (
							<Text style={styles.helperText}>
								Aucun avatar uploadé, les initiales sont affichées.
							</Text>
						)}
					</View>

					<Text style={styles.sectionTitle}>Couleur de fond des initiales</Text>
					<ScrollView
						horizontal
						showsHorizontalScrollIndicator={false}
						style={styles.colorsScroll}
						contentContainerStyle={styles.colorsContainer}>
						{AVATAR_COLORS.map((color, index) => {
							const isSelected = selectedColor === color;
							return (
								<Pressable
									key={`${color}-${index}`}
									style={[
										styles.colorChip,
										{ backgroundColor: color },
										isSelected && styles.colorChipSelected,
									]}
									onPress={() => updateColor(color)}
									disabled={updatePreferences.isPending || isUploading}
								/>
							);
						})}
					</ScrollView>

					<Pressable
						onPress={uploadAvatar}
						disabled={isUploading || isDeleting}
						style={[
							buttonBlack,
							styles.uploadButton,
							isUploading && styles.dimmed,
						]}>
						{isUploading ? (
							<ActivityIndicator color={colorWhite} />
						) : (
							<Text style={styles.uploadButtonText}>
								Uploader un nouvel avatar
							</Text>
						)}
					</Pressable>
					<Pressable
						onPress={copyAvatarLogs}
						disabled={isCopyingLogs}
						style={[
							styles.copyLogsButton,
							isCopyingLogs && styles.dimmed,
						]}>
						{isCopyingLogs ? (
							<ActivityIndicator color={colorBlack} />
						) : (
							<Text style={styles.copyLogsButtonText}>
								Copier les logs avatar ({avatarLogs.length})
							</Text>
						)}
					</Pressable>
					<View style={styles.bottomSpacer} />
				</BottomSheetView>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
}

const styles = StyleSheet.create({
	sheetBackground: {
		backgroundColor: primaryBackground,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	hiddenIndicator: {
		backgroundColor: "transparent",
	},
	scrollArea: {
		paddingHorizontal: 24,
	},
	scrollContent: {
		paddingBottom: 12,
	},
	sheetContent: {
		gap: 16,
		paddingTop: 8,
	},
	title: {
		fontSize: FontSize18,
		fontWeight: "bold",
	},
	previewContainer: {
		alignItems: "center",
		gap: 10,
		paddingBottom: 6,
	},
	deleteButton: {
		backgroundColor: colorBlack,
		borderRadius: 999,
		paddingVertical: 8,
		paddingHorizontal: 16,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		minWidth: 165,
		justifyContent: "center",
	},
	deleteButtonText: {
		color: colorWhite,
		fontWeight: "700",
	},
	sectionTitle: {
		fontSize: FontSize16,
		fontWeight: "700",
	},
	colorsContainer: {
		flexDirection: "row",
		paddingRight: 8,
	},
	colorsScroll: {
		maxHeight: 44,
	},
	colorChip: {
		width: 38,
		height: 38,
		borderRadius: 38,
		borderWidth: 1,
		borderColor: colorBlack,
		marginRight: 10,
	},
	colorChipSelected: {
		borderWidth: 3,
	},
	uploadButton: {
		marginTop: 22,
		alignSelf: "center",
	},
	uploadButtonText: {
		color: colorWhite,
		fontWeight: "700",
	},
	copyLogsButton: {
		alignSelf: "center",
		marginTop: 8,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colorBlack,
		backgroundColor: "transparent",
	},
	copyLogsButtonText: {
		color: colorBlack,
		fontWeight: "700",
		fontSize: 12,
	},
	helperText: {
		color: colorDarkGrey,
		textAlign: "center",
	},
	dimmed: {
		opacity: 0.7,
	},
	bottomSpacer: {
		height: 40,
	},
});
