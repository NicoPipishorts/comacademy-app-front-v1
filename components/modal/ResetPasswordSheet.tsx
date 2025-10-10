import ModalGestureLine from "@/components/experience/modalGestureLine";
import PasswordRequirements from "@/components/experience/passwordRequirements";
import PasswordStrengthMeter from "@/components/experience/passwordStrengthMeter";
import {
	colorBlack,
	colorGrey,
	colorPink,
	colorWhite,
} from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
import { FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
	BottomSheetModal,
	BottomSheetScrollView,
	BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import React, {
	forwardRef,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	ActivityIndicator,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

interface ResetPasswordSheetProps {
	resetCode: string | null;
	isSubmitting: boolean;
	onSubmit: (payload: {
		password: string;
		passwordConfirmation: string;
		code: string;
	}) => void;
	onDismiss?: () => void;
	title?: string;
	description?: string;
}

const DEFAULT_TITLE = "Réinitialiser le mot de passe";
const DEFAULT_DESCRIPTION =
	"Choisissez un nouveau mot de passe répondant aux critères ci-dessous.";

const ResetPasswordSheet = forwardRef<
	BottomSheetModal,
	ResetPasswordSheetProps
>(
	(
		{
			resetCode,
			isSubmitting,
			onSubmit,
			onDismiss,
			title = DEFAULT_TITLE,
			description = DEFAULT_DESCRIPTION,
		},
		ref
	) => {
		const [password, setPassword] = useState("");
		const [confirmPassword, setConfirmPassword] = useState("");
		const [showPassword, setShowPassword] = useState(false);
		const [showConfirmPassword, setShowConfirmPassword] = useState(false);
		const snapPoints = useMemo(() => ["75%", "90%"], []);

		useEffect(() => {
			setPassword("");
			setConfirmPassword("");
		}, [resetCode]);

		const renderBackdrop = useCallback(
			(props: BottomSheetBackdropProps) => (
				<BottomSheetBackdrop
					{...props}
					appearsOnIndex={0}
					disappearsOnIndex={-1}
					pressBehavior='close'
				/>
			),
			[]
		);

		const handleSubmit = useCallback(() => {
			if (!resetCode) return;
			onSubmit({
				password,
				passwordConfirmation: confirmPassword,
				code: resetCode,
			});
		}, [confirmPassword, onSubmit, password, resetCode]);

		const handleDismiss = useCallback(() => {
			setPassword("");
			setConfirmPassword("");
			setShowPassword(false);
			setShowConfirmPassword(false);
			onDismiss?.();
		}, [onDismiss]);

		const hasMismatch =
			confirmPassword.trim().length > 0 &&
			password.trim().length > 0 &&
			password !== confirmPassword;

		const isButtonDisabled =
			isSubmitting ||
			!resetCode ||
			password.trim().length === 0 ||
			confirmPassword.trim().length === 0 ||
			hasMismatch;

		return (
			<BottomSheetModal
				ref={ref}
				index={0}
				snapPoints={snapPoints}
				backgroundStyle={styles.sheetBackground}
				handleIndicatorStyle={styles.hiddenIndicator}
				enablePanDownToClose
				enableDynamicSizing={false}
				backdropComponent={renderBackdrop}
				onDismiss={handleDismiss}
				keyboardBehavior='extend'
				keyboardBlurBehavior='restore'
				android_keyboardInputMode='adjustResize'>
				<BottomSheetScrollView
					style={styles.sheetContent}
					contentContainerStyle={styles.scrollContentContainer}
					keyboardShouldPersistTaps='handled'>
					<ModalGestureLine />
					<Text style={styles.sheetTitle}>{title}</Text>
					<Text style={styles.sheetDescription}>{description}</Text>

					<View>
						<View style={styles.inputWrapper}>
							<BottomSheetTextInput
								style={styles.sheetInput}
								value={password}
								onChangeText={setPassword}
								placeholder='Nouveau mot de passe'
								placeholderTextColor={colorGrey}
								autoCapitalize='none'
								secureTextEntry={!showPassword}
								textContentType='newPassword'
								autoCorrect={false}
							/>
							<MaterialCommunityIcons
								name={showPassword ? "eye-off" : "eye"}
								size={22}
								color={colorBlack}
								style={styles.eyeIcon}
								onPress={() => setShowPassword((prev) => !prev)}
							/>
						</View>

						<PasswordStrengthMeter password={password} />
						<PasswordRequirements password={password} />
					</View>

					<View>
						<View style={styles.inputWrapper}>
							<BottomSheetTextInput
								style={styles.sheetInput}
								value={confirmPassword}
								onChangeText={setConfirmPassword}
								placeholder='Confirmer le mot de passe'
								placeholderTextColor={colorGrey}
								autoCapitalize='none'
								secureTextEntry={!showConfirmPassword}
								textContentType='password'
								autoCorrect={false}
							/>
							<MaterialCommunityIcons
								name={showConfirmPassword ? "eye-off" : "eye"}
								size={22}
								color={colorBlack}
								style={styles.eyeIcon}
								onPress={() => setShowConfirmPassword((prev) => !prev)}
							/>
						</View>
						{hasMismatch ? (
							<Text style={styles.errorText}>
								Les mots de passe ne correspondent pas.
							</Text>
						) : null}
					</View>

					<Pressable
						onPress={handleSubmit}
						disabled={isButtonDisabled}
						style={[
							buttonBlack,
							isButtonDisabled && styles.resetButtonDisabled,
						]}>
						{isSubmitting ? (
							<ActivityIndicator color={colorWhite} />
						) : (
							<Text style={styles.resetButtonText}>Reset</Text>
						)}
					</Pressable>
				</BottomSheetScrollView>
			</BottomSheetModal>
		);
	}
);

ResetPasswordSheet.displayName = "ResetPasswordSheet";

const styles = StyleSheet.create({
	sheetBackground: {
		backgroundColor: colorWhite,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
	},
	hiddenIndicator: {
		backgroundColor: "transparent",
	},
	sheetContent: {
		paddingHorizontal: 24,
	},
	scrollContentContainer: {
		paddingTop: 8,
		paddingBottom: 24,
		gap: 20,
	},
	sheetTitle: {
		fontSize: FontSizeH1,
		fontWeight: "bold",
		color: colorBlack,
	},
	sheetDescription: {
		fontSize: FontSize16,
		color: colorBlack,
	},
	inputWrapper: {
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 1,
		borderColor: colorGrey,
		borderRadius: 12,
		paddingHorizontal: 16,
	},
	sheetInput: {
		flex: 1,
		paddingVertical: 14,
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorBlack,
	},
	eyeIcon: {
		marginLeft: 10,
	},
	errorText: {
		marginTop: 8,
		color: colorPink,
		fontSize: FontSize16,
	},
	resetButtonDisabled: {
		opacity: 0.6,
	},
	resetButtonText: {
		color: colorWhite,
		fontWeight: "bold",
		fontSize: FontSize16,
		textTransform: "uppercase",
	},
});

export default ResetPasswordSheet;
