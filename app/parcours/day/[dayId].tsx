import {
	useCompleteParcoursDay,
	useParcoursDay,
	useStartParcoursDay,
	useUpdateParcoursDayProgress,
} from "@/api/parcours/useParcours";
import Loader from "@/components/experience/loader";
import {
	colorBlack,
	colorDarkGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import useJwtToken from "@/hooks/useJwtToken";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const prettyType = (value?: unknown) =>
	String(value || "")
		.replace(/_/g, " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function ParcoursDayScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ dayId?: string | string[] }>();
	const dayId = Number(Array.isArray(params.dayId) ? params.dayId[0] : params.dayId);
	const { token, loading: loadingToken } = useJwtToken();
	const { data, isLoading } = useParcoursDay(
		Number.isFinite(dayId) ? dayId : null,
		token,
		loadingToken
	);
	const startDay = useStartParcoursDay();
	const updateProgress = useUpdateParcoursDayProgress();
	const completeDay = useCompleteParcoursDay();
	const hasStartedRef = useRef(false);
	const day = data?.data;
	const steps = useMemo(() => day?.stepsPayload?.steps || [], [day?.stepsPayload?.steps]);
	const initialIndex = day?.progression?.currentStepIndex || 0;
	const [activeIndex, setActiveIndex] = useState(initialIndex);

	useEffect(() => {
		setActiveIndex(initialIndex);
	}, [initialIndex]);

	useEffect(() => {
		if (!day || !token || hasStartedRef.current) {
			return;
		}

		if (day.progression.status === "ready" || day.progression.status === "in_progress") {
			hasStartedRef.current = true;
			void startDay.mutateAsync({ dayId: day.id, token });
		}
	}, [day, startDay, token]);

	if (isLoading) {
		return <Loader />;
	}

	const totalSteps = steps.length;
	const currentStep = steps[activeIndex] || null;
	const canGoBack = activeIndex > 0;
	const canGoForward = activeIndex < totalSteps - 1;
	const isReadOnly = day?.progression.isReadOnly;

	const persistProgress = async (nextIndex: number) => {
		if (!day || !token || isReadOnly) {
			return;
		}

		await updateProgress.mutateAsync({
			dayId: day.id,
			token,
			payload: {
				currentStepIndex: nextIndex,
				lastProgressPayload: {
					activeStepId:
						typeof currentStep?.id === "string" ? currentStep.id : null,
				},
			},
		});
	};

	const handleNext = async () => {
		if (!day) return;

		if (canGoForward) {
			const nextIndex = activeIndex + 1;
			setActiveIndex(nextIndex);
			await persistProgress(nextIndex);
			return;
		}

		if (!token || isReadOnly) return;

		await completeDay.mutateAsync({
			dayId: day.id,
			token,
			payload: {
				currentStepIndex: activeIndex,
				lastProgressPayload: {
					activeStepId:
						typeof currentStep?.id === "string" ? currentStep.id : null,
				},
			},
		});
		router.back();
	};

	const handlePrevious = async () => {
		if (!canGoBack) return;
		const nextIndex = activeIndex - 1;
		setActiveIndex(nextIndex);
		await persistProgress(nextIndex);
	};

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
			<Stack.Screen options={{ headerShown: false, presentation: "fullScreenModal" }} />
			<View style={styles.modalHandle} />
			<View style={styles.headerRow}>
				<View style={styles.headerTextBlock}>
					<Text style={styles.kicker}>{prettyType(day?.dayKey)}</Text>
					<Text style={styles.title}>{day?.themeTitle || "Challenge du jour"}</Text>
					<Text style={styles.subtitle}>
						{day?.themeSubtitle || day?.stepsPayload?.dayMeta?.title || ""}
					</Text>
				</View>
				<Pressable onPress={() => router.back()} style={styles.closeButton}>
					<Text style={styles.closeButtonText}>Fermer</Text>
				</Pressable>
			</View>

			<View style={styles.progressRow}>
				<Text style={styles.progressText}>
					Etape {Math.min(activeIndex + 1, Math.max(totalSteps, 1))}/{Math.max(totalSteps, 1)}
				</Text>
				<Text style={styles.progressText}>
					{day?.progression.isReadOnly ? "Lecture seule" : "Interactif"}
				</Text>
			</View>

			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingBottom: insets.bottom + 120,
				}}>
				<View style={styles.stepCard}>
					<Text style={styles.stepType}>{prettyType(currentStep?.type)}</Text>
					<Text style={styles.stepTitle}>
						{typeof currentStep?.id === "string"
							? currentStep.id
							: `Etape ${activeIndex + 1}`}
					</Text>
					<Text style={styles.stepBody}>
						{JSON.stringify(currentStep || {}, null, 2)}
					</Text>
				</View>
			</ScrollView>

			<View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
				<Pressable
					onPress={() => {
						void handlePrevious();
					}}
					disabled={!canGoBack}
					style={[styles.secondaryButton, !canGoBack && styles.buttonDisabled]}>
					<Text style={styles.secondaryButtonText}>Precedent</Text>
				</Pressable>
				<Pressable
					onPress={() => {
						void handleNext();
					}}
					disabled={isReadOnly}
					style={[styles.primaryButton, isReadOnly && styles.buttonDisabled]}>
					<Text style={styles.primaryButtonText}>
						{canGoForward ? "Suivant" : "Terminer"}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	modalHandle: {
		width: 54,
		height: 5,
		borderRadius: 999,
		backgroundColor: "#D8D8D8",
		alignSelf: "center",
		marginBottom: 18,
	},
	headerRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingHorizontal: 20,
		marginBottom: 16,
		gap: 12,
	},
	headerTextBlock: {
		flex: 1,
	},
	kicker: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorDarkGrey,
		letterSpacing: 0.8,
	},
	title: {
		fontSize: FontSizeH1,
		fontWeight: "800",
		color: colorBlack,
	},
	subtitle: {
		fontSize: FontSize16,
		fontWeight: "500",
		color: colorDarkGrey,
	},
	closeButton: {
		backgroundColor: colorBlack,
		paddingHorizontal: 14,
		paddingVertical: 10,
		borderRadius: 999,
	},
	closeButtonText: {
		color: colorWhite,
		fontSize: FontSize14,
		fontWeight: "800",
	},
	progressRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
		marginBottom: 12,
	},
	progressText: {
		fontSize: FontSize14,
		fontWeight: "700",
		color: colorDarkGrey,
	},
	stepCard: {
		backgroundColor: colorWhite,
		borderRadius: 24,
		padding: 20,
	},
	stepType: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorDarkGrey,
		marginBottom: 8,
	},
	stepTitle: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 12,
	},
	stepBody: {
		fontSize: 13,
		lineHeight: 20,
		color: colorBlack,
		fontFamily: "Courier",
	},
	footer: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		paddingHorizontal: 20,
		paddingTop: 12,
		backgroundColor: "rgba(245,245,245,0.96)",
		flexDirection: "row",
		gap: 12,
	},
	primaryButton: {
		flex: 1,
		backgroundColor: colorBlack,
		paddingVertical: 16,
		borderRadius: 18,
		alignItems: "center",
	},
	secondaryButton: {
		flex: 1,
		backgroundColor: colorWhite,
		paddingVertical: 16,
		borderRadius: 18,
		alignItems: "center",
	},
	primaryButtonText: {
		color: colorWhite,
		fontSize: FontSize16,
		fontWeight: "800",
	},
	secondaryButtonText: {
		color: colorBlack,
		fontSize: FontSize16,
		fontWeight: "800",
	},
	buttonDisabled: {
		opacity: 0.45,
	},
});
