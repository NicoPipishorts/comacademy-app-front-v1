import { useParcoursTimeline } from "@/api/parcours/useParcours";
import bonusPinkIcon from "@/assets/imgs/parcours/Bonus-1.svg";
import bonusGreenIcon from "@/assets/imgs/parcours/Bonus-2.svg";
import bonusLockedIcon from "@/assets/imgs/parcours/Bonus-locked.svg";
import connectorLeftIcon from "@/assets/imgs/parcours/line-connecter-left.svg";
import connectorRightIcon from "@/assets/imgs/parcours/line-connecter-rightsvg.svg";
import quizPinkIcon from "@/assets/imgs/parcours/Quiz-1.svg";
import quizGreenIcon from "@/assets/imgs/parcours/Quiz-2.svg";
import quizBlueIcon from "@/assets/imgs/parcours/Quiz-3.svg";
import quizGreyIcon from "@/assets/imgs/parcours/Quiz-grey.svg";
import { ParcoursDayStatusBadge } from "@/components/parcours/ParcoursDayStatusBadge";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import Loader from "@/components/experience/loader";
import { colorBlack, colorDarkGrey, primaryBackground } from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { isParcoursWeekOpen } from "@/helpers/parcours/week";
import useJwtToken from "@/hooks/useJwtToken";
import { ParcoursTimelineWeek } from "@/types/parcours";
import { useAssets } from "expo-asset";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";

const quizAssets = [quizPinkIcon, quizGreenIcon, quizBlueIcon];
const bonusAssets = [bonusPinkIcon, bonusGreenIcon];

const getQuizThemeIndex = (week: ParcoursTimelineWeek) =>
	Math.max(0, Number(week.programOrder || 1) - 1) % quizAssets.length;

const getBonusThemeIndex = (week: ParcoursTimelineWeek) =>
	Math.max(0, Number(week.programOrder || 1) - 1) % bonusAssets.length;

const dayLabel = (dayKey: string) =>
	({
		monday: "Lun",
		tuesday: "Mar",
		wednesday: "Mer",
		thursday: "Jeu",
		friday: "Ven",
	}[dayKey] || dayKey);

const weekLabel = (week: ParcoursTimelineWeek) =>
	week.weekLabel || `Semaine ${week.programOrder}`;

function SvgAsset({
	source,
	width,
	height,
	style,
}: {
	source: any;
	width: number;
	height: number;
	style?: object;
}) {
	const [assets] = useAssets([source]);
	const uri = assets?.[0]?.localUri ?? assets?.[0]?.uri;

	if (!uri) {
		return <View style={[{ width, height }, style]} />;
	}

	return <SvgUri uri={uri} width={width} height={height} style={style as any} />;
}

function getBonusIcon(week: ParcoursTimelineWeek) {
	const isUpcomingLockedWeek =
		week.status === "not_started" &&
		week.days.every((day) => day.status === "locked");

	if (isUpcomingLockedWeek) {
		return bonusLockedIcon;
	}

	if (!week.bonus || week.bonus.status === "locked") {
		return bonusLockedIcon;
	}

	if (week.bonus.status === "unlocked" || week.bonus.status === "viewed") {
		return bonusAssets[getBonusThemeIndex(week)];
	}

	return bonusLockedIcon;
}

function getActivityIcon(week: ParcoursTimelineWeek) {
	const isUpcomingLockedWeek =
		week.status === "not_started" &&
		week.days.every((day) => day.status === "locked");

	if (isUpcomingLockedWeek) {
		return quizGreyIcon;
	}

	return quizAssets[getQuizThemeIndex(week)];
}

function TimelineWeekSection({
	week,
	index,
}: {
	week: ParcoursTimelineWeek;
	index: number;
}) {
	const isRightAligned = index % 2 === 1;
	const connectorSource = index % 2 === 0 ? connectorLeftIcon : connectorRightIcon;
	const isWeekOpen = isParcoursWeekOpen(week);

	return (
		<Pressable
			disabled={!isWeekOpen}
			onPress={() => {
				if (!isWeekOpen) {
					return;
				}

				router.push({
					pathname: "/parcours/week/[weekId]",
					params: { weekId: String(week.id) },
				});
			}}
			style={styles.sectionBlock}>
			<Text style={styles.sectionWeekLabel}>{weekLabel(week)}</Text>

			<View
				style={[
					styles.nodeRow,
					styles.activityNodeRow,
					isRightAligned && styles.activityNodeRowRight,
				]}>
				<View
					style={[
						styles.iconColumn,
						isRightAligned && styles.activityIconColumnRight,
					]}>
					<SvgAsset
						source={getActivityIcon(week)}
						width={72}
						height={72}
					/>
				</View>
				<View
					style={[
						styles.contentColumn,
						isRightAligned && styles.activityContentColumnRight,
					]}>
					<Text style={styles.nodeTitle}>Activites</Text>
					<View style={styles.daysStatusRow}>
						{week.days.map((day) => (
							<View key={day.id} style={styles.dayStatusItem}>
								<ParcoursDayStatusBadge status={day.status} size={20} />
								<Text style={styles.dayLabel}>{dayLabel(day.dayKey)}</Text>
							</View>
						))}
					</View>
				</View>
			</View>

			<View
				style={[
					styles.connectorRow,
					isRightAligned && styles.connectorRowRight,
				]}>
				<View
					style={[
						styles.connectorWrap,
						isRightAligned && styles.connectorWrapRight,
					]}>
					<SvgAsset source={connectorSource} width={36} height={60} />
				</View>
			</View>

			<View
				style={[
					styles.nodeRow,
					isRightAligned && styles.bonusNodeRowRight,
				]}>
				<View
					style={[
						styles.iconColumn,
						styles.bonusIconColumnLeft,
						isRightAligned && styles.bonusIconColumnRight,
					]}>
					<View style={styles.bonusIconWrap}>
						<SvgAsset
							source={getBonusIcon(week)}
							width={72}
							height={72}
						/>
					</View>
				</View>
				<View
					style={[
						styles.contentColumn,
						styles.bonusContentColumnLeft,
						isRightAligned && styles.bonusContentColumnRight,
					]}>
					<Text style={styles.nodeTitle}>Bonus</Text>
				</View>
			</View>
		</Pressable>
	);
}

export default function ParcoursScreen() {
	const insets = useSafeAreaInsets();
	const scrollViewRef = useRef<ScrollView>(null);
	const [isPullRefreshing, setIsPullRefreshing] = useState(false);
	const { token, loading: loadingToken } = useJwtToken();
	const {
		data,
		error,
		isError,
		isLoading,
		refetch,
	} = useParcoursTimeline(token, loadingToken);

	useTrackPageMetrics({ page: "Parcours" });

	const weeks = data?.data || [];
	const errorMessage =
		error instanceof Error ? error.message : "Erreur inconnue";

	const scrollToLatestWeek = useCallback(() => {
		requestAnimationFrame(() => {
			scrollViewRef.current?.scrollToEnd({ animated: false });
		});
	}, []);

	useEffect(() => {
		if (!weeks.length) {
			return;
		}

		scrollToLatestWeek();
	}, [weeks.length, scrollToLatestWeek]);

	useFocusEffect(
		useCallback(() => {
			if (!weeks.length) {
				return;
			}

			scrollToLatestWeek();
		}, [weeks.length, scrollToLatestWeek])
	);

	if (isLoading) {
		return <Loader />;
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='Parcours'
				showAvatar={false}
				containerStyle={styles.headerContainer}
			/>
			<ScrollView
				ref={scrollViewRef}
				contentContainerStyle={{
					paddingHorizontal: 30,
					paddingBottom: insets.bottom + 106,
					paddingTop: 12,
					flexGrow: 1,
					justifyContent: weeks.length === 0 ? "center" : "flex-end",
				}}
				onContentSizeChange={() => {
					if (!weeks.length) {
						return;
					}

					scrollToLatestWeek();
				}}
				refreshControl={
					<RefreshControl
						refreshing={isPullRefreshing}
						onRefresh={() => {
							setIsPullRefreshing(true);
							void refetch().finally(() => {
								setIsPullRefreshing(false);
							});
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
					weeks.map((week, index) => (
						<TimelineWeekSection key={week.id} week={week} index={index} />
					))
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
	sectionBlock: {
		paddingTop: 10,
		paddingBottom: 22,
	},
	sectionWeekLabel: {
		fontSize: FontSize14,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 18,
	},
	nodeRow: {
		flexDirection: "row",
		alignItems: "center",
	},
	activityNodeRow: {
		marginBottom: 6,
	},
	activityNodeRowRight: {
		marginBottom: 2,
	},
	iconColumn: {
		width: 104,
		alignItems: "center",
	},
	activityIconColumnRight: {
		transform: [{ translateX: 70 }],
	},
	bonusIconColumnLeft: {
		transform: [{ translateX: 52 }],
	},
	bonusIconColumnRight: {
		transform: [{ translateX: 36 }],
	},
	contentColumn: {
		flex: 1,
		paddingLeft: 10,
	},
	activityContentColumnRight: {
		paddingLeft: 70,
	},
	bonusContentColumnLeft: {
		paddingLeft: 54,
	},
	bonusContentColumnRight: {
		paddingLeft: 38,
	},
	nodeTitle: {
		fontSize: 22,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 8,
	},
	daysStatusRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 8,
		flexWrap: "nowrap",
	},
	dayStatusItem: {
		alignItems: "center",
		gap: 4,
		minWidth: 24,
	},
	dayLabel: {
		fontSize: 12,
		fontWeight: "700",
		color: colorDarkGrey,
	},
	connectorRow: {
		height: 52,
		justifyContent: "center",
	},
	connectorRowRight: {
		height: 64,
	},
	connectorWrap: {
		width: 104,
		alignItems: "center",
	},
	connectorWrapRight: {
		transform: [{ translateX: 70 }],
	},
	bonusIconWrap: {
		width: 72,
		height: 72,
	},
	bonusNodeRowRight: {
		marginTop: 6,
	},
	emptyState: {
		minHeight: 260,
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
