import BlurBackdrop from "@/components/experience/backdropComponent";
import ModalGestureLine from "@/components/experience/modalGestureLine";
import SectionAboutArrow from "@/components/onboarding/SectionAboutArrow";
import { colorBlack, colorWhite, primaryBackground } from "@/constants/colors";
import { buttonBlack } from "@/constants/commonStyles";
import { FontSize16 } from "@/constants/fontsizes";
import { SECTION_ABOUT } from "@/constants/sectionOnboarding";
import useBottomSheetVisibility from "@/hooks/useBottomSheetVisibility";
import type { OnboardingSection } from "@/services/onboarding/SectionOnboarding";
import { BottomSheetModal, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useRef } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Props {
	section: OnboardingSection;
	visible: boolean;
	onClose: () => void;
}

const SNAP_POINTS = ["92%"];

export default function SectionAboutModal({
	section,
	visible,
	onClose,
}: Props) {
	const content = SECTION_ABOUT[section];
	const bottomSheetRef = useRef<BottomSheetModal>(null);
	const snapPoints = useMemo(() => SNAP_POINTS, []);

	const notifyDismissed = useBottomSheetVisibility(bottomSheetRef, visible);

	const handleDismiss = useCallback(() => {
		notifyDismissed();
		onClose();
	}, [notifyDismissed, onClose]);

	return (
		<BottomSheetModal
			ref={bottomSheetRef}
			index={0}
			snapPoints={snapPoints}
			backdropComponent={(props) => <BlurBackdrop {...props} />}
			backgroundStyle={styles.sheetBackground}
			handleIndicatorStyle={styles.hiddenIndicator}
			enablePanDownToClose
			onDismiss={handleDismiss}
			style={styles.bottomSheetModal}>
			<BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
				<ModalGestureLine />
				<Text style={styles.title}>{content.title}</Text>
				<View style={styles.bullets}>
					{content.bullets.map((bullet, index) => (
						<View key={bullet} style={styles.bulletRow}>
							<SectionAboutArrow
								size={24}
								colors={content.arrowColors}
								gradientId={`aboutArrow-${section}-${index}`}
							/>
							<Text style={styles.bulletText}>{bullet}</Text>
						</View>
					))}
				</View>
				<TouchableOpacity
					style={[buttonBlack, styles.closeButton]}
					onPress={onClose}
					accessibilityRole='button'
					accessibilityLabel='Fermer les explications'>
					<Text style={styles.closeButtonText}>Retour</Text>
				</TouchableOpacity>
			</BottomSheetScrollView>
		</BottomSheetModal>
	);
}

const styles = StyleSheet.create({
	bottomSheetModal: {
		zIndex: 99999,
		elevation: 99999,
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
	contentContainer: {
		paddingHorizontal: 30,
		paddingBottom: 48,
		flexGrow: 1,
	},
	title: {
		fontSize: 30,
		lineHeight: 36,
		fontWeight: "800",
		color: colorBlack,
		marginTop: 42,
	},
	bullets: {
		marginTop: 44,
		gap: 18,
	},
	bulletRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 14,
	},
	bulletText: {
		flex: 1,
		fontSize: FontSize16,
		lineHeight: 22,
		fontWeight: "700",
		color: colorBlack,
		paddingTop: 1,
	},
	closeButton: {
		marginTop: "auto",
		paddingVertical: 14,
		paddingHorizontal: 48,
	},
	closeButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "bold",
	},
});
