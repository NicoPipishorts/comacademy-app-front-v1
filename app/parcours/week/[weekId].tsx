import { useParcoursWeek } from "@/api/parcours/useParcours";
import Loader from "@/components/experience/loader";
import {
	colorBlack,
	colorDarkGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import useJwtToken from "@/hooks/useJwtToken";
import { ParcoursTimelineDay } from "@/types/parcours";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dayLabel = (dayKey: string) =>
	({
		monday: "Lundi",
		tuesday: "Mardi",
		wednesday: "Mercredi",
		thursday: "Jeudi",
		friday: "Vendredi",
	}[dayKey] || dayKey);

function DayRow({ day }: { day: ParcoursTimelineDay }) {
	const isDisabled = day.isLocked;

	return (
		<Pressable
			disabled={isDisabled}
			onPress={() =>
				router.push({
					pathname: "/parcours/day/[dayId]",
					params: { dayId: String(day.id) },
				})
			}
			style={[
				styles.dayRow,
				isDisabled && styles.dayRowDisabled,
				!isDisabled && day.status === "ready" && {
					borderLeftColor: day.accentColor || colorBlack,
				},
			]}>
			<View style={styles.dayRowMain}>
				<Text style={styles.dayRowTitle}>{dayLabel(day.dayKey)}</Text>
				<Text style={styles.dayRowSubtitle}>
					{day.themeTitle || "Challenge du jour"}
				</Text>
			</View>
			<Text style={[styles.dayRowStatus, isDisabled && styles.dayRowStatusDisabled]}>
				{day.status === "locked"
					? "Verrouille"
					: day.status === "expired"
						? "Lecture seule"
						: day.status === "completed"
							? "Complet"
							: day.status === "in_progress"
								? "Continuer"
								: "Jouer"}
			</Text>
		</Pressable>
	);
}

export default function ParcoursWeekScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ weekId?: string | string[] }>();
	const weekId = Number(Array.isArray(params.weekId) ? params.weekId[0] : params.weekId);
	const { token, loading: loadingToken } = useJwtToken();
	const { data, isLoading } = useParcoursWeek(
		Number.isFinite(weekId) ? weekId : null,
		token,
		loadingToken
	);

	if (isLoading) {
		return <Loader />;
	}

	const week = data?.data;

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top + 8 }]}>
			<Stack.Screen options={{ headerShown: false, presentation: "modal" }} />
			<View style={styles.modalHandle} />
			<View style={styles.headerRow}>
				<View style={styles.headerTextBlock}>
					<Text style={styles.kicker}>PARCOURS {week?.programOrder}</Text>
					<Text style={styles.title}>{week?.title || "Parcours"}</Text>
					<Text style={styles.subtitle}>
						{week?.weekLabel || "Semaine en cours"}
					</Text>
				</View>
				<Pressable onPress={() => router.back()} style={styles.closeButton}>
					<Text style={styles.closeButtonText}>Fermer</Text>
				</Pressable>
			</View>

			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 20,
					paddingBottom: insets.bottom + 32,
					gap: 14,
				}}>
				{week?.days?.map((day) => <DayRow key={day.id} day={day} />)}
			</ScrollView>
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
		marginBottom: 20,
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
	dayRow: {
		backgroundColor: colorWhite,
		borderRadius: 22,
		padding: 18,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		borderLeftWidth: 6,
		borderLeftColor: "#E8E8E8",
	},
	dayRowDisabled: {
		opacity: 0.55,
	},
	dayRowMain: {
		flex: 1,
		gap: 4,
	},
	dayRowTitle: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
	},
	dayRowSubtitle: {
		fontSize: FontSize14,
		fontWeight: "500",
		color: colorDarkGrey,
	},
	dayRowStatus: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorBlack,
	},
	dayRowStatusDisabled: {
		color: colorDarkGrey,
	},
});
