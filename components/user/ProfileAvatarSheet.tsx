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
import * as ImagePicker from "expo-image-picker";
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

export default function ProfileAvatarSheet({ visible, onClose }: Props) {
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ["90%"], []);
	const { auth } = useAuthSession();
	const { token } = useJwtToken();
	const { data } = useGetUserPreferences(auth?.user.id);
	const updatePreferences = useUpdateUserPreferences();
	const [isUploading, setIsUploading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const preference = resolveUserPreference(data);
	const selectedColor = preference?.avatarBackgroundColor || colorYellow;
	const avatarUrl = resolveUserPreferenceAvatarUrl(preference);

	useEffect(() => {
		if (visible) {
			bottomSheetRef.current?.present();
		} else {
			bottomSheetRef.current?.dismiss();
		}
	}, [visible]);

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

	const updateColor = (color: string) => {
		updatePreferences.mutate({ avatarBackgroundColor: color });
	};

	const deleteAvatar = async () => {
		if (!token) return;

		try {
			setIsDeleting(true);
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/user-preferences/me/avatar`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				const body = await response.text();
				throw new Error(
					`Delete avatar failed (${response.status}): ${body || "Unknown error"}`,
				);
			}

			await queryClient.invalidateQueries({ queryKey: ["UserPreferences"] });
		} catch (error) {
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
		if (!token) return;

		try {
			const permission =
				await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (!permission.granted) {
				Alert.alert(
					"Autorisation requise",
					"Autorise l’accès aux photos pour importer un avatar.",
				);
				return;
			}

			const pickResult = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (pickResult.canceled || !pickResult.assets.length) {
				return;
			}

			const asset = pickResult.assets[0];
			const filename = asset.fileName || `avatar-${Date.now()}.jpg`;
			const mimeType = asset.mimeType || "image/jpeg";

			setIsUploading(true);

			const formData = new FormData();
			formData.append("files", {
				uri: asset.uri,
				name: filename,
				type: mimeType,
			} as any);

			const uploadResponse = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/upload`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${token}`,
					},
					body: formData,
				},
			);

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

			if (!Number.isFinite(avatarFileId) || avatarFileId <= 0) {
				throw new Error("Invalid uploaded file id");
			}

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

			if (!attachResponse.ok) {
				const body = await attachResponse.text();
				throw new Error(
					`Attach avatar failed (${attachResponse.status}): ${body || "Unknown error"}`,
				);
			}

			await queryClient.invalidateQueries({ queryKey: ["UserPreferences"] });
		} catch (error) {
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
