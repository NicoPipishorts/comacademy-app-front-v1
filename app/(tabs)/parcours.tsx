import { useParcoursTimeline } from "@/api/parcours/useParcours";
import bonusPinkIcon from "@/assets/imgs/parcours/Bonus-1.png";
import bonusGreenIcon from "@/assets/imgs/parcours/Bonus-2.png";
import bonusBlueIcon from "@/assets/imgs/parcours/Bonus-3.png";
import bonusLockedIcon from "@/assets/imgs/parcours/Bonus-Lock.png";
import connectorLeftIcon from "@/assets/imgs/parcours/line-connecter-left.svg";
import connectorRightIcon from "@/assets/imgs/parcours/line-connecter-rightsvg.svg";
import ParcoursComingSoonScreen from "@/components/parcours/ParcoursComingSoonScreen";
import { ParcoursDayStatusBadge } from "@/components/parcours/ParcoursDayStatusBadge";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import CelebrationConfetti from "@/components/experience/CelebrationConfetti";
import Loader from "@/components/experience/loader";
import { colorBlack, colorDarkGrey, primaryBackground } from "@/constants/colors";
import { FontSize14, FontSize16, FontSizeH1 } from "@/constants/fontsizes";
import { isParcoursEnabled } from "@/constants/featureFlags";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { isParcoursWeekOpen } from "@/helpers/parcours/week";
import { getParcoursTimelineActivityIcon } from "@/helpers/parcours/icons";
import useJwtToken from "@/hooks/useJwtToken";
import { ParcoursTimelineWeek } from "@/types/parcours";
import { useAssets } from "expo-asset";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	Image,
	Pressable,
	RefreshControl,
	ScrollView,
	StyleSheet,
	Text,
	View,
	ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SvgUri } from "react-native-svg";
import Animated, {
	Easing,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withTiming,
} from "react-native-reanimated";

const bonusAssets = [bonusPinkIcon, bonusGreenIcon, bonusBlueIcon];

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

function PngAsset({
	source,
	width,
	height,
	style,
	renderScale = 3,
	imageTranslateY = 0,
}: {
	source: any;
	width: number;
	height: number;
	style?: object;
	renderScale?: number;
	imageTranslateY?: number;
}) {
	return (
		<View style={[styles.pngIconSlot, { width, height }, style]}>
			<Image
				source={source}
				resizeMode='contain'
				style={{
					width: width * renderScale,
					height: height * renderScale,
					transform: [{ translateY: imageTranslateY }],
				}}
			/>
		</View>
	);
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

function BonusUnlockIcon({
	week,
	imageTranslateY,
	shouldCelebrate,
	isDevelopmentPreview,
	onCelebrationStart,
}: {
	week: ParcoursTimelineWeek;
	imageTranslateY: number;
	shouldCelebrate: boolean;
	isDevelopmentPreview: boolean;
	onCelebrationStart: () => void;
}) {
	const progress = useSharedValue(shouldCelebrate ? 0 : 1);
	const hasStartedRef = useRef(false);
	const isUnlocked =
		week.bonus?.status === "unlocked" || week.bonus?.status === "viewed";
	const canReveal = isUnlocked || isDevelopmentPreview;

	useEffect(() => {
		if (!shouldCelebrate || !canReveal || hasStartedRef.current) {
			return undefined;
		}

		hasStartedRef.current = true;
		const celebrationTimer = setTimeout(onCelebrationStart, 520);
		progress.value = withDelay(
			260,
			withTiming(1, {
				duration: 820,
				easing: Easing.out(Easing.cubic),
			})
		);

		return () => clearTimeout(celebrationTimer);
	}, [canReveal, onCelebrationStart, progress, shouldCelebrate]);

	const lockedStyle = useAnimatedStyle<ViewStyle>(() => ({
		opacity: interpolate(progress.value, [0, 0.48, 0.7], [1, 1, 0]),
		transform: [
			{ scale: interpolate(progress.value, [0, 0.5, 1], [1, 0.78, 0.78]) },
			{ rotateZ: `${interpolate(progress.value, [0, 0.55], [0, -10])}deg` },
		] as ViewStyle["transform"],
	}));
	const unlockedStyle = useAnimatedStyle<ViewStyle>(() => ({
		opacity: interpolate(progress.value, [0, 0.42, 0.72, 1], [0, 0, 1, 1]),
		transform: [
			{ scale: interpolate(progress.value, [0, 0.45, 0.78, 1], [0.65, 0.65, 1.16, 1]) },
			{ rotateZ: `${interpolate(progress.value, [0.42, 0.72, 1], [9, -3, 0])}deg` },
		] as ViewStyle["transform"],
	}));

	if (!shouldCelebrate || !canReveal) {
		return (
			<PngAsset
				source={getBonusIcon(week)}
				width={72}
				height={72}
				imageTranslateY={imageTranslateY}
			/>
		);
	}

	return (
		<View style={styles.bonusIconLayers}>
			<Animated.View style={[styles.bonusIconLayer, lockedStyle]}>
				<PngAsset
					source={bonusLockedIcon}
					width={72}
					height={72}
					imageTranslateY={imageTranslateY}
				/>
			</Animated.View>
			<Animated.View style={[styles.bonusIconLayer, unlockedStyle]}>
				<PngAsset
					source={bonusAssets[getBonusThemeIndex(week)]}
					width={72}
					height={72}
					imageTranslateY={imageTranslateY}
				/>
			</Animated.View>
		</View>
	);
}

function TimelineWeekSection({
	week,
	index,
	celebratingBonusWeekId,
	previewingBonusWeekId,
	onBonusCelebrationStart,
	onBonusPreview,
}: {
	week: ParcoursTimelineWeek;
	index: number;
	celebratingBonusWeekId: number | null;
	previewingBonusWeekId: number | null;
	onBonusCelebrationStart: (weekId: number) => void;
	onBonusPreview: (weekId: number) => void;
}) {
	const isRightAligned = index % 2 === 1;
	const connectorSource = index % 2 === 0 ? connectorLeftIcon : connectorRightIcon;
	const isWeekOpen = isParcoursWeekOpen(week);
	const activityIconOffsetY = isRightAligned ? 22 : 18;
	const bonusIconOffsetY = isRightAligned ? 0 : 18;
	const bonusLongPressHandledRef = useRef(false);
	const handleBonusCelebrationStart = useCallback(
		() => onBonusCelebrationStart(week.id),
		[onBonusCelebrationStart, week.id]
	);

	return (
		<View style={styles.sectionBlock}>
			<Text style={styles.sectionWeekLabel}>{weekLabel(week)}</Text>

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
					<PngAsset
						source={getParcoursTimelineActivityIcon(week)}
						width={72}
						height={72}
						imageTranslateY={activityIconOffsetY}
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
			</Pressable>

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

			<Pressable
				delayLongPress={500}
				disabled={
					!__DEV__ && (!week.bonus || week.bonus.status === "locked")
				}
				onLongPress={() => {
					if (!__DEV__) {
						return;
					}

					bonusLongPressHandledRef.current = true;
					onBonusPreview(week.id);
				}}
				onPress={() => {
					if (bonusLongPressHandledRef.current) {
						bonusLongPressHandledRef.current = false;
						return;
					}

					if (!week.bonus || week.bonus.status === "locked") {
						return;
					}

					router.push({
						pathname: "/bonus",
						params: { bonusId: String(week.bonus.id) },
					});
				}}
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
						<BonusUnlockIcon
							key={
								celebratingBonusWeekId === week.id ? "celebrating" : "idle"
							}
							week={week}
							imageTranslateY={bonusIconOffsetY}
							shouldCelebrate={celebratingBonusWeekId === week.id}
							isDevelopmentPreview={previewingBonusWeekId === week.id}
							onCelebrationStart={handleBonusCelebrationStart}
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
			</Pressable>
		</View>
	);
}

export default function ParcoursScreen() {
	if (!isParcoursEnabled) {
		return <ParcoursComingSoonScreen />;
	}

	return <ParcoursTimelineScreen />;
}

function ParcoursTimelineScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{
		bonusUnlockWeekId?: string | string[];
	}>();
	const scrollViewRef = useRef<ScrollView>(null);
	const celebrationCleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
		null
	);
	const [isPullRefreshing, setIsPullRefreshing] = useState(false);
	const [celebratingBonusWeekId, setCelebratingBonusWeekId] = useState<
		number | null
	>(null);
	const [previewingBonusWeekId, setPreviewingBonusWeekId] = useState<
		number | null
	>(null);
	const [confettiRunId, setConfettiRunId] = useState(0);
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
	const bonusUnlockWeekIdParam = Array.isArray(params.bonusUnlockWeekId)
		? params.bonusUnlockWeekId[0]
		: params.bonusUnlockWeekId;

	useEffect(() => {
		const weekId = Number(bonusUnlockWeekIdParam);
		if (!Number.isFinite(weekId) || weekId <= 0) {
			return;
		}

		setCelebratingBonusWeekId(weekId);
		setPreviewingBonusWeekId(null);
		router.setParams({ bonusUnlockWeekId: undefined });
	}, [bonusUnlockWeekIdParam]);

	useEffect(
		() => () => {
			if (celebrationCleanupTimerRef.current) {
				clearTimeout(celebrationCleanupTimerRef.current);
			}
		},
		[]
	);

	const handleBonusCelebrationStart = useCallback((weekId: number) => {
		setConfettiRunId((current) => current + 1);

		if (celebrationCleanupTimerRef.current) {
			clearTimeout(celebrationCleanupTimerRef.current);
		}

		celebrationCleanupTimerRef.current = setTimeout(() => {
			setCelebratingBonusWeekId((current) =>
				current === weekId ? null : current
			);
			setPreviewingBonusWeekId((current) =>
				current === weekId ? null : current
			);
		}, 3400);
	}, []);

	const handleBonusPreview = useCallback((weekId: number) => {
		if (!__DEV__) {
			return;
		}

		setPreviewingBonusWeekId(weekId);
		setCelebratingBonusWeekId(weekId);
	}, []);

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
			void refetch();

			if (!weeks.length) {
				return;
			}

			scrollToLatestWeek();
		}, [refetch, weeks.length, scrollToLatestWeek])
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
						<TimelineWeekSection
							key={week.id}
							week={week}
							index={index}
							celebratingBonusWeekId={celebratingBonusWeekId}
							previewingBonusWeekId={previewingBonusWeekId}
							onBonusCelebrationStart={handleBonusCelebrationStart}
							onBonusPreview={handleBonusPreview}
						/>
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
			{confettiRunId > 0 ? <CelebrationConfetti key={confettiRunId} /> : null}
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
	bonusIconLayers: {
		width: 72,
		height: 72,
	},
	bonusIconLayer: {
		...StyleSheet.absoluteFillObject,
	},
	pngIconSlot: {
		alignItems: "center",
		justifyContent: "center",
		overflow: "visible",
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
