import { useParcoursTimeline } from "@/api/parcours/useParcours";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import Loader from "@/components/experience/loader";
import {
	colorBlack,
	colorDarkGrey,
	colorGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useJwtToken from "@/hooks/useJwtToken";
import { ParcoursTimelineDay, ParcoursTimelineWeek } from "@/types/parcours";
import { router } from "expo-router";
import React from "react";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dayLabel = (dayKey: string) =>
	({
		monday: "Lun",
		tuesday: "Mar",
		wednesday: "Mer",
		thursday: "Jeu",
		friday: "Ven",
	}[dayKey] || dayKey);

const weekStatusLabel = (status: ParcoursTimelineWeek["status"]) =>
	({
		not_started: "A commencer",
		in_progress: "En cours",
		completed: "Complet",
		expired: "Termine",
	}[status] || status);

const dayStatusLabel = (status: ParcoursTimelineDay["status"]) =>
	({
		ready: "Pret",
		in_progress: "Continuer",
		completed: "Complet",
		expired: "Lecture seule",
		locked: "Verrouille",
	}[status] || status);

function TimelineWeekCard({ week }: { week: ParcoursTimelineWeek }) {
	return (
		<Pressable
			onPress={() =>
				router.push({
					pathname: "/parcours/week/[weekId]",
					params: { weekId: String(week.id) },
				})
			}
			style={styles.weekCard}>
			<View style={styles.weekCardHeader}>
				<View style={styles.weekTitleBlock}>
					<Text style={styles.weekEyebrow}>PARCOURS {week.programOrder}</Text>
					<Text style={styles.weekTitle}>{week.title}</Text>
					<Text style={styles.weekSubtitle}>
						{week.weekLabel || weekStatusLabel(week.status)}
					</Text>
				</View>
				<View style={styles.weekMetaPill}>
					<Text style={styles.weekMetaText}>
						{week.completedDaysCount}/{week.totalDaysCount}
					</Text>
				</View>
			</View>

			<View style={styles.daysRow}>
				{week.days.map((day) => {
					const backgroundColor = day.isLocked
						? "#ECECEC"
						: day.status === "completed"
							? colorBlack
							: day.accentColor || colorGrey;

					return (
						<View key={day.id} style={styles.dayChipWrap}>
							<View style={[styles.dayChip, { backgroundColor }]}>
								<Text
									style={[
										styles.dayChipText,
										(day.isLocked || day.status === "ready") &&
											styles.dayChipTextDark,
									]}>
									{dayLabel(day.dayKey)}
								</Text>
							</View>
							<Text style={styles.dayStateText}>{dayStatusLabel(day.status)}</Text>
						</View>
					);
				})}
			</View>

			{week.bonus && (
				<View style={styles.bonusRow}>
					<Text style={styles.bonusLabel}>Bonus</Text>
					<Text style={styles.bonusValue}>
						{week.bonus.status === "unlocked"
							? "Disponible"
							: week.bonus.status === "viewed"
								? "Vu"
								: "Verrouille"}
					</Text>
				</View>
			)}
		</Pressable>
	);
}

export default function ParcoursScreen() {
	const insets = useSafeAreaInsets();
	const { token, loading: loadingToken } = useJwtToken();
	const { data, error, isError, isLoading, isFetching, refetch } = useParcoursTimeline(
		token,
		loadingToken
	);

	useTrackPageMetrics({ page: "Parcours" });

	if (isLoading) {
		return <Loader />;
	}

	const weeks = data?.data || [];
	const errorMessage =
		error instanceof Error ? error.message : "Erreur inconnue";

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='Parcours'
				containerStyle={styles.headerContainer}
			/>
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: insets.bottom + 110,
					paddingTop: 8,
					gap: 18,
					flexGrow: weeks.length === 0 ? 1 : 0,
					justifyContent: weeks.length === 0 ? "center" : "flex-start",
				}}
				refreshControl={
					<RefreshControl
						refreshing={isFetching}
						onRefresh={() => {
							void refetch();
						}}
					/>
				}>
				{isError ? (
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>API parcours indisponible</Text>
						<Text style={styles.emptyDescription}>{errorMessage}</Text>
						<Text style={styles.debugHint}>
							Verifie que Strapi a redemarre avec les routes `parcours`,
							que le role `Authenticated` peut y acceder, et qu&apos;au
							moins une semaine est en `generated` ou `published`.
						</Text>
					</View>
				) : weeks.length > 0 ? (
					weeks.map((week) => <TimelineWeekCard key={week.id} week={week} />)
				) : (
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>Aucun parcours disponible</Text>
						<Text style={styles.emptyDescription}>
							Le programme n&apos;est pas encore expose par l&apos;API.
						</Text>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	headerContainer: {
		paddingHorizontal: 24,
	},
	weekCard: {
		backgroundColor: colorWhite,
		borderRadius: 28,
		padding: 20,
		gap: 16,
	},
	weekCardHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		gap: 12,
	},
	weekTitleBlock: {
		flex: 1,
		gap: 4,
	},
	weekEyebrow: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorDarkGrey,
		letterSpacing: 0.8,
	},
	weekTitle: {
		fontSize: FontSizeH1,
		fontWeight: "800",
		color: colorBlack,
	},
	weekSubtitle: {
		fontSize: FontSize16,
		fontWeight: "500",
		color: colorDarkGrey,
	},
	weekMetaPill: {
		backgroundColor: "#F1F1F1",
		paddingHorizontal: 12,
		paddingVertical: 8,
		borderRadius: 999,
	},
	weekMetaText: {
		fontSize: FontSize14,
		fontWeight: "700",
		color: colorBlack,
	},
	daysRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
	},
	dayChipWrap: {
		gap: 6,
		alignItems: "center",
		minWidth: 52,
	},
	dayChip: {
		width: 48,
		height: 48,
		borderRadius: 16,
		alignItems: "center",
		justifyContent: "center",
	},
	dayChipText: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorWhite,
	},
	dayChipTextDark: {
		color: colorBlack,
	},
	dayStateText: {
		fontSize: 11,
		fontWeight: "600",
		color: colorDarkGrey,
		textAlign: "center",
	},
	bonusRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingTop: 4,
		borderTopWidth: 1,
		borderTopColor: "#EFEFEF",
	},
	bonusLabel: {
		fontSize: FontSize14,
		fontWeight: "700",
		color: colorDarkGrey,
	},
	bonusValue: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorBlack,
	},
	emptyState: {
		minHeight: 260,
		borderRadius: 28,
		alignItems: "center",
		justifyContent: "center",
		padding: 28,
	},
	emptyTitle: {
		fontSize: FontSizeH1,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 8,
		textAlign: "center",
	},
	emptyDescription: {
		fontSize: FontSize16,
		fontWeight: "500",
		color: colorDarkGrey,
		textAlign: "center",
	},
	debugHint: {
		marginTop: 12,
		fontSize: FontSize14,
		fontWeight: "500",
		color: colorDarkGrey,
		textAlign: "center",
		lineHeight: 20,
	},
});
