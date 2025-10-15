import ModalGestureLine from "@/components/experience/modalGestureLine";
import { colorBlack, colorGrey, colorWhite } from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
import { FontSize16, FontSizeH1 } from "@/constants/fontsizes";
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
import { ActivityIndicator, Pressable, StyleSheet, Text } from "react-native";

interface ForgotPasswordSheetProps {
	initialEmail?: string;
	isSubmitting: boolean;
	onSubmit: (email: string) => void;
	onDismiss?: () => void;
	title?: string;
	description?: string;
}

const DEFAULT_TITLE = "Mot de passe oublié";
const DEFAULT_DESCRIPTION =
	"Entrez l'email associé à votre compte pour recevoir un lien de réinitialisation.";

const ForgotPasswordSheet = forwardRef<
	BottomSheetModal,
	ForgotPasswordSheetProps
>(
	(
		{
			initialEmail = "",
			isSubmitting,
			onSubmit,
			onDismiss,
			title = DEFAULT_TITLE,
			description = DEFAULT_DESCRIPTION,
		},
		ref
	) => {
		const [email, setEmail] = useState(initialEmail);
		const snapPoints = useMemo(() => ["38%", "74%"], []);

		useEffect(() => {
			setEmail(initialEmail);
		}, [initialEmail]);

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
			onSubmit(email.trim());
		}, [email, onSubmit]);

		const handleDismiss = useCallback(() => {
			setEmail(initialEmail);
			onDismiss?.();
		}, [initialEmail, onDismiss]);

		const buttonDisabled = isSubmitting || email.trim().length === 0;

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
					<BottomSheetTextInput
						style={styles.sheetInput}
						value={email}
						onChangeText={setEmail}
						placeholder='Email'
						placeholderTextColor={colorGrey}
						autoCapitalize='none'
						keyboardType='email-address'
						textContentType='emailAddress'
						autoCorrect={false}
					/>
					<Pressable
						onPress={handleSubmit}
						disabled={buttonDisabled}
						style={[buttonBlack, buttonDisabled && styles.resetButtonDisabled]}>
						{isSubmitting ? (
							<ActivityIndicator color={colorWhite} />
						) : (
							<Text style={styles.resetButtonText}>Envoyer</Text>
						)}
					</Pressable>
				</BottomSheetScrollView>
			</BottomSheetModal>
		);
	}
);

ForgotPasswordSheet.displayName = "ForgotPasswordSheet";

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
	sheetInput: {
		width: "100%",
		borderWidth: 1,
		borderColor: colorGrey,
		borderRadius: 12,
		paddingHorizontal: 16,
		paddingVertical: 14,
		fontSize: FontSize16,
		fontWeight: "bold",
		color: colorBlack,
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

export default ForgotPasswordSheet;
