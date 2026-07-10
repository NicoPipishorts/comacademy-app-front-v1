import ModalGestureLine from "@/components/experience/modalGestureLine";
import PasswordRequirements from "@/components/experience/passwordRequirements";
import PasswordStrengthMeter from "@/components/experience/passwordStrengthMeter";
import {
	colorBlack,
	colorGrey,
	colorRed,
	colorWhite,
} from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { useSnackbar } from "@/context/snackBar";
import { getPasswordRequirements } from "@/helpers/passwordRequirement";
import useJwtToken from "@/hooks/useJwtToken";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetTextInput,
	BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	ActivityIndicator,
	Keyboard,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
	visible: boolean;
	onClose: () => void;
}

const parseErrorMessage = async (response: Response) => {
	try {
		const payload = await response.json();
		const fromNested = payload?.error?.message;
		const fromTop = payload?.message;
		if (typeof fromNested === "string" && fromNested.trim().length > 0) {
			return fromNested.trim();
		}
		if (typeof fromTop === "string" && fromTop.trim().length > 0) {
			return fromTop.trim();
		}
	} catch {
		// Fallback below when response isn't JSON.
	}

	return "Impossible de modifier le mot de passe.";
};

export default function ChangePasswordSheet({ visible, onClose }: Props) {
	const insets = useSafeAreaInsets();
	const { token } = useJwtToken();
	const showSnackbar = useSnackbar();
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => ["90%"], []);
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		if (visible) {
			bottomSheetRef.current?.present();
			return;
		}
		bottomSheetRef.current?.dismiss();
	}, [visible]);

	const resetForm = useCallback(() => {
		setCurrentPassword("");
		setNewPassword("");
		setShowCurrentPassword(false);
		setShowNewPassword(false);
		setErrorMessage(null);
		setIsSubmitting(false);
	}, []);

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

	const validateForm = () => {
		if (!currentPassword.trim() || !newPassword.trim()) {
			setErrorMessage("Tous les champs sont obligatoires.");
			return false;
		}

		if (currentPassword === newPassword) {
			setErrorMessage(
				"Le nouveau mot de passe doit être différent de l'ancien.",
			);
			return false;
		}

		const requirements = getPasswordRequirements(newPassword);
		const isValid = Object.values(requirements).every(Boolean);
		if (!isValid) {
			setErrorMessage("Le nouveau mot de passe ne respecte pas les critères.");
			return false;
		}

		setErrorMessage(null);
		return true;
	};

	const handleSubmit = async () => {
		if (!token) {
			setErrorMessage("Session invalide. Reconnectez-vous.");
			return;
		}

		if (!validateForm()) {
			return;
		}

		try {
			setIsSubmitting(true);
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/auth/change-password`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						currentPassword,
						password: newPassword,
						passwordConfirmation: newPassword,
					}),
				},
			);

			if (!response.ok) {
				const message = await parseErrorMessage(response);
				setErrorMessage(message);
				showSnackbar(message, "error");
				return;
			}

			showSnackbar("Mot de passe modifié.", "success");
			bottomSheetRef.current?.dismiss();
		} catch (error) {
			const message =
				error instanceof Error && error.message.trim().length > 0
					? error.message
					: "Impossible de modifier le mot de passe.";
			setErrorMessage(message);
			showSnackbar(message, "error");
		} finally {
			setIsSubmitting(false);
		}
	};

	const onDismiss = useCallback(() => {
		resetForm();
		onClose();
	}, [onClose, resetForm]);

	const handleAnimate = useCallback((_fromIndex: number, toIndex: number) => {
		if (toIndex === -1) {
			Keyboard.dismiss();
		}
	}, []);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			index={0}
			snapPoints={snapPoints}
			enablePanDownToClose
			enableDynamicSizing={true}
			keyboardBehavior='extend'
			keyboardBlurBehavior='restore'
			android_keyboardInputMode='adjustResize'
			backdropComponent={renderBackdrop}
			onDismiss={onDismiss}
			onAnimate={handleAnimate}
			backgroundStyle={styles.sheetBackground}
			handleIndicatorStyle={styles.hiddenIndicator}>
			<BottomSheetScrollView
				style={styles.scrollArea}
				contentContainerStyle={[
					styles.scrollContent,
					{ paddingBottom: Math.max(insets.bottom + 40, 64) },
				]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps='handled'>
				<BottomSheetView style={styles.sheetContent}>
					<ModalGestureLine />
					<Text style={styles.title}>Modifier le mot de passe</Text>
					<Text style={styles.description}>
						Saisissez votre mot de passe actuel puis le nouveau.
					</Text>

					{errorMessage ? (
						<View style={styles.errorBox}>
							<Text style={styles.errorText}>{errorMessage}</Text>
						</View>
					) : null}

					<View style={styles.inputWrapper}>
						<BottomSheetTextInput
							style={styles.input}
							placeholder='Mot de passe actuel'
							placeholderTextColor={colorGrey}
							autoCapitalize='none'
							autoCorrect={false}
							textContentType='password'
							secureTextEntry={!showCurrentPassword}
							value={currentPassword}
							onChangeText={setCurrentPassword}
						/>
						<MaterialCommunityIcons
							name={showCurrentPassword ? "eye-off" : "eye"}
							size={22}
							color={colorBlack}
							style={styles.eyeIcon}
							onPress={() => setShowCurrentPassword((prev) => !prev)}
						/>
					</View>

					<View style={styles.inputWrapper}>
						<BottomSheetTextInput
							style={styles.input}
							placeholder='Nouveau mot de passe'
							placeholderTextColor={colorGrey}
							autoCapitalize='none'
							autoCorrect={false}
							textContentType='newPassword'
							autoComplete='new-password'
							secureTextEntry={!showNewPassword}
							value={newPassword}
							onChangeText={setNewPassword}
						/>
						<MaterialCommunityIcons
							name={showNewPassword ? "eye-off" : "eye"}
							size={22}
							color={colorBlack}
							style={styles.eyeIcon}
							onPress={() => setShowNewPassword((prev) => !prev)}
						/>
					</View>

					<PasswordStrengthMeter password={newPassword} />
					<PasswordRequirements password={newPassword} />

					<Pressable
						onPress={handleSubmit}
						style={[
							buttonBlack,
							styles.submitButton,
							isSubmitting && styles.submitButtonDisabled,
						]}
						disabled={isSubmitting}>
						{isSubmitting ? (
							<ActivityIndicator color={colorWhite} />
						) : (
							<Text style={styles.submitButtonText}>Mettre à jour</Text>
						)}
					</Pressable>
				</BottomSheetView>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
}

const styles = StyleSheet.create({
	sheetBackground: {
		backgroundColor: colorWhite,
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
		paddingBottom: 24,
	},
	sheetContent: {
		paddingTop: 8,
		paddingBottom: 32,
		gap: 12,
	},
	title: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		color: colorBlack,
	},
	description: {
		fontSize: FontSize16,
		color: colorBlack,
	},
	errorBox: {
		borderWidth: 1,
		borderStyle: "dashed",
		borderColor: colorRed,
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 8,
	},
	errorText: {
		color: colorRed,
		fontSize: FontSize14,
		fontWeight: "bold",
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: colorGrey,
		borderRadius: 12,
		paddingHorizontal: 14,
	},
	input: {
		flex: 1,
		paddingVertical: 14,
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorBlack,
	},
	eyeIcon: {
		marginLeft: 10,
	},
	submitButton: {
		marginTop: 8,
		minWidth: "100%",
		alignItems: "center",
	},
	submitButtonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
		textTransform: "uppercase",
	},
});
