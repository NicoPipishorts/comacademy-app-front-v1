import { useParcoursWeek } from "@/api/parcours/useParcours";
import ReturnButton from "@/components/buttons/returnButton";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import Loader from "@/components/experience/loader";
import {
	colorBlack,
	colorDarkGrey,
	colorGreen,
	colorPink,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import {
	FontSize12,
	FontSize14,
	FontSize16,
	FontSize18,
	FontSizeH2,
} from "@/constants/fontsizes";
import useJwtToken from "@/hooks/useJwtToken";
import { ParcoursTimelineDay, ParcoursWeekDetail } from "@/types/parcours";
import { router, Stack, useLocalSearchParams } from "expo-router";
import React from "react";
import {
	Pressable,
	ScrollView,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	View,
	ViewStyle,
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

type DayCardPresentation = {
	containerStyle: StyleProp<ViewStyle>;
	titleStyle: StyleProp<TextStyle>;
	subtitleStyle: StyleProp<TextStyle>;
	label: string | null;
	labelStyle: StyleProp<ViewStyle> | null;
	labelTextStyle: StyleProp<TextStyle> | null;
	buttonStyle: StyleProp<ViewStyle> | null;
	buttonTextStyle: StyleProp<TextStyle> | null;
	isAction: boolean;
};

const normalizeThemeColor = (value?: string | null) => {
	const raw = String(value || "").trim();
	if (!raw) {
		return null;
	}

	if (raw.startsWith("#")) {
		return raw;
	}

	if (/^[0-9A-Fa-f]{6}$/u.test(raw) || /^[0-9A-Fa-f]{3}$/u.test(raw)) {
		return `#${raw}`;
	}

	return raw;
};

const countStartedDays = (days: ParcoursTimelineDay[]) =>
	days.filter((day) => day.status === "completed" || day.status === "in_progress")
		.length;

const formatProgressLabel = (week: ParcoursWeekDetail) => {
	const startedCount = countStartedDays(week.days || []);
	const totalCount = week.totalDaysCount || week.days?.length || 0;
	return `${startedCount} activite${startedCount > 1 ? "s" : ""} sur ${totalCount}`;
};

const getProgressRatio = (week: ParcoursWeekDetail) => {
	const totalCount = week.totalDaysCount || week.days?.length || 0;
	if (!totalCount) {
		return 0;
	}

	return countStartedDays(week.days || []) / totalCount;
};

const getCurrentReadyDayId = (days: ParcoursTimelineDay[]) => {
	const readyDays = days.filter((day) => day.status === "ready");
	if (!readyDays.length) {
		return null;
	}

	return readyDays.reduce((latest, day) =>
		day.sortOrder > latest.sortOrder ? day : latest
	).id;
};

const getDayCardPresentation = (
	day: ParcoursTimelineDay,
	isCurrentReadyDay: boolean
): DayCardPresentation => {
	const themeColor =
		normalizeThemeColor(day.accentColor) ||
		normalizeThemeColor(day.category?.color) ||
		colorPink;

	if (day.isLocked) {
		return {
			containerStyle: styles.dayCardLocked,
			titleStyle: styles.dayTitleLocked,
			subtitleStyle: styles.daySubtitleLocked,
			label: null,
			labelStyle: null,
			labelTextStyle: null,
			buttonStyle: null,
			buttonTextStyle: null,
			isAction: false,
		};
	}

	if (day.status === "completed") {
		return {
			containerStyle: styles.dayCardDefault,
			titleStyle: styles.dayTitle,
			subtitleStyle: styles.daySubtitle,
			label: "Complet",
			labelStyle: styles.metaPillSuccess,
			labelTextStyle: styles.metaPillSuccessText,
			buttonStyle: null,
			buttonTextStyle: null,
			isAction: false,
		};
	}

	if (day.status === "in_progress") {
		return {
			containerStyle: [
				styles.dayCardDefault,
				styles.dayCardInProgress,
				{ borderColor: themeColor },
			],
			titleStyle: styles.dayTitle,
			subtitleStyle: styles.daySubtitle,
			label: "Incomplet",
			labelStyle: [styles.metaPillAccent, { backgroundColor: `${themeColor}1A` }],
			labelTextStyle: [styles.metaPillAccentText, { color: themeColor }],
			buttonStyle: null,
			buttonTextStyle: null,
			isAction: false,
		};
	}

	if (day.status === "ready") {
		return {
			containerStyle: isCurrentReadyDay
				? [styles.dayCardDefault, styles.dayCardReady, { borderColor: themeColor }]
				: styles.dayCardDefault,
			titleStyle: styles.dayTitle,
			subtitleStyle: styles.daySubtitle,
			label: isCurrentReadyDay ? "Commencer" : "Disponible",
			labelStyle: isCurrentReadyDay ? null : styles.metaPillMuted,
			labelTextStyle: isCurrentReadyDay ? null : styles.metaPillMutedText,
			buttonStyle: isCurrentReadyDay
				? [styles.actionButton, { backgroundColor: themeColor }]
				: null,
			buttonTextStyle: styles.actionButtonText,
			isAction: isCurrentReadyDay,
		};
	}

	return {
		containerStyle: styles.dayCardDefault,
		titleStyle: styles.dayTitle,
		subtitleStyle: styles.daySubtitle,
		label: "Lecture seule",
		labelStyle: styles.metaPillMuted,
		labelTextStyle: styles.metaPillMutedText,
		buttonStyle: null,
		buttonTextStyle: null,
		isAction: false,
	};
};

function ProgressCard({ week }: { week: ParcoursWeekDetail }) {
	const progressRatio = getProgressRatio(week);

	return (
		<View style={styles.progressCard}>
			<Text style={styles.progressTitle}>
				{week.weekLabel || `Semaine ${week.programOrder}`}
			</Text>
			<Text style={styles.progressMeta}>{formatProgressLabel(week)}</Text>
			<View style={styles.progressTrack}>
				<View
					style={[
						styles.progressFill,
						{ width: `${Math.max(progressRatio * 100, 3)}%` },
					]}
				/>
			</View>
		</View>
	);
}

function DayRow({
	day,
	isCurrentReadyDay,
}: {
	day: ParcoursTimelineDay;
	isCurrentReadyDay: boolean;
}) {
	const card = getDayCardPresentation(day, isCurrentReadyDay);

	return (
		<Pressable
			disabled={day.isLocked}
			onPress={() =>
				router.push({
					pathname: "/parcours/day/[dayId]",
					params: { dayId: String(day.id) },
				})
			}
			style={[styles.dayCard, card.containerStyle]}>
			<View style={styles.dayTextColumn}>
				<Text style={[styles.dayLabel, card.titleStyle]}>{dayLabel(day.dayKey)}</Text>
				<Text
					numberOfLines={1}
					ellipsizeMode='tail'
					style={[styles.dayHeadline, card.subtitleStyle]}>
					{day.themeTitle || "Challenge du jour"}
				</Text>
			</View>
			{card.label ? (
				card.isAction ? (
					<View style={card.buttonStyle}>
						<Text style={card.buttonTextStyle}>{card.label}</Text>
					</View>
				) : (
					<View style={card.labelStyle}>
						<Text style={[styles.metaPillText, card.labelTextStyle]}>
							{card.label}
						</Text>
					</View>
				)
			) : null}
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
	const currentReadyDayId = week ? getCurrentReadyDayId(week.days || []) : null;
	const contentBottomPadding = insets.bottom + 124;
	const floatingButtonBottom = Math.max(insets.bottom, 14);

	if (!week) {
		return (
			<View style={[styles.wrapper, { paddingTop: insets.top }]}>
				<Stack.Screen options={{ headerShown: false, presentation: "card" }} />
				<PageTitleAvatarHeader
					title='Activités'
					showAvatar={false}
					containerStyle={styles.headerContainer}
					contentStyle={styles.headerContent}
				/>
				<EmptyWeekState />
			</View>
		);
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<Stack.Screen options={{ headerShown: false, presentation: "card" }} />
			<PageTitleAvatarHeader
				title='Activités'
				showAvatar={false}
				containerStyle={styles.headerContainer}
				contentStyle={styles.headerContent}
			/>
			<ScrollView
				contentContainerStyle={{
					paddingHorizontal: 24,
					paddingBottom: contentBottomPadding,
				}}
				showsVerticalScrollIndicator={false}>
				<ProgressCard week={week} />
				<View style={styles.daysList}>
					{week.days?.map((day) => (
						<DayRow
							key={day.id}
							day={day}
							isCurrentReadyDay={day.id === currentReadyDayId}
						/>
					))}
				</View>
			</ScrollView>
			<View
				pointerEvents='box-none'
				style={[styles.floatingReturnWrap, { bottom: floatingButtonBottom }]}>
				<ReturnButton variant='floating' />
			</View>
		</View>
	);
}

function EmptyWeekState() {
	return (
		<View style={styles.emptyState}>
			<Text style={styles.emptyTitle}>Semaine introuvable</Text>
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
		paddingBottom: 4,
	},
	headerContent: {
		paddingTop: 10,
		paddingBottom: 4,
	},
	progressCard: {
		backgroundColor: colorBlack,
		borderRadius: 22,
		padding: 14,
		marginTop: 8,
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 16 },
		shadowOpacity: 0.12,
		shadowRadius: 24,
		elevation: 3,
	},
	progressTitle: {
		fontSize: FontSizeH2,
		fontWeight: "800",
		color: colorWhite,
		marginBottom: 20,
	},
	progressMeta: {
		fontSize: FontSize12,
		fontWeight: "700",
		color: colorWhite,
		marginBottom: 12,
		opacity: 0.9,
	},
	progressTrack: {
		height: 14,
		borderRadius: 999,
		backgroundColor: colorWhite,
		overflow: "hidden",
	},
	progressFill: {
		height: "100%",
		borderRadius: 999,
		backgroundColor: colorGreen,
	},
	daysList: {
		gap: 16,
		paddingTop: 22,
	},
	dayCard: {
		
		borderRadius: 22,
		paddingHorizontal: 14,
		paddingVertical: 16,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		shadowColor: colorBlack,
		shadowOffset: { width: 0, height: 16 },
		shadowOpacity: 0.08,
		shadowRadius: 24,
		elevation: 2,
	},
	dayCardDefault: {
		backgroundColor: colorWhite,
	},
	dayCardReady: {
		borderWidth: 4,
	},
	dayCardInProgress: {
		borderWidth: 3,
	},
	dayCardLocked: {
		backgroundColor: "#E4E4E4",
		shadowOpacity: 0,
		elevation: 0,
	},
	dayTextColumn: {
		flex: 1,
		paddingRight: 12,
	},
	dayLabel: {
		fontSize: FontSize12,
		fontWeight: "800",
		marginBottom: 6,
	},
	dayHeadline: {
		fontSize: FontSize18,
		fontWeight: "800",
		lineHeight: 20,
	},
	dayTitle: {
		color: colorBlack,
	},
	daySubtitle: {
		color: colorBlack,
	},
	dayTitleLocked: {
		color: colorWhite,
		opacity: 0.85,
	},
	daySubtitleLocked: {
		color: colorWhite,
		opacity: 0.92,
	},
	metaPillSuccess: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#D6FFD9",
	},
	metaPillWarning: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#FFE4D1",
	},
	metaPillWarningText: {
		color: "#F0781D",
	},
	metaPillAccent: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
	},
	metaPillAccentText: {
		fontSize: FontSize12,
		fontWeight: "800",
	},
	metaPillMuted: {
		paddingHorizontal: 14,
		paddingVertical: 8,
		borderRadius: 999,
		backgroundColor: "#ECECEC",
	},
	metaPillText: {
		fontSize: FontSize12,
		fontWeight: "800",
		color: colorBlack,
	},
	metaPillSuccessText: {
		color: "#2FB35A",
	},
	metaPillMutedText: {
		color: colorDarkGrey,
	},
	actionButton: {
		paddingHorizontal: 18,
		paddingVertical: 14,
		borderRadius: 999,
		backgroundColor: colorPink,
		minWidth: 118,
		alignItems: "center",
		justifyContent: "center",
	},
	actionButtonText: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorWhite,
	},
	floatingReturnWrap: {
		position: "absolute",
		left: 0,
		right: 0,
		alignItems: "center",
	},
	emptyState: {
		flex: 1,
		paddingHorizontal: 24,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyTitle: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
	},
});
