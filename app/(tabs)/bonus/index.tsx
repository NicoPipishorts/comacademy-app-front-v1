import {
	useMarkParcoursBonusViewed,
	useParcoursBonuses,
} from "@/api/parcours/useParcours";
import bonusPinkIcon from "@/assets/imgs/parcours/Bonus-1.png";
import bonusGreenIcon from "@/assets/imgs/parcours/Bonus-2.png";
import bonusBlueIcon from "@/assets/imgs/parcours/Bonus-3.png";
import ReturnButton from "@/components/buttons/returnButton";
import Loader from "@/components/experience/loader";
import ExpoVideo, { ManagedVideoHandle } from "@/components/media/ExpoVideo";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";
import {
	colorBlack,
	colorDarkGrey,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import { FontSize12, FontSize22 } from "@/constants/fontsizes";
import { getPublicBaseUrl } from "@/helpers/api/buildApiUrl";
import { resolveParcoursVideoUri } from "@/helpers/parcours/video";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import useJwtToken from "@/hooks/useJwtToken";
import { ParcoursUserBonus } from "@/types/parcours";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	FlatList,
	Image,
	ImageSourcePropType,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const bonusAssets = [bonusPinkIcon, bonusGreenIcon, bonusBlueIcon];

const toAbsoluteMediaUrl = (value?: string | null) => {
	const raw = String(value || "").trim();
	if (!raw) return null;
	if (/^https?:\/\//iu.test(raw)) return raw;
	return raw.startsWith("/") ? `${getPublicBaseUrl()}${raw}` : raw;
};

const formatBonusWeek = (bonus: ParcoursUserBonus) => {
	const start = bonus.week.weekStartAt
		? new Date(bonus.week.weekStartAt)
		: null;
	const end = bonus.week.weekEndAt ? new Date(bonus.week.weekEndAt) : null;

	if (!start || !end || Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return bonus.week.weekLabel || `Semaine ${bonus.week.programOrder}`;
	}

	const startDay = new Intl.DateTimeFormat("fr-FR", {
		timeZone: "Europe/Paris",
		day: "numeric",
	}).format(start);
	const endLabel = new Intl.DateTimeFormat("fr-FR", {
		timeZone: "Europe/Paris",
		day: "numeric",
		month: "long",
		year: "numeric",
	}).format(end);

	return `Semaine du ${startDay} au ${endLabel}`;
};

const getBonusIcon = (bonus: ParcoursUserBonus): ImageSourcePropType => {
	const requestedIndex = Number(bonus.payload?.themeIndex);
	const themeIndex = Number.isFinite(requestedIndex)
		? requestedIndex
		: Math.max(0, bonus.week.programOrder - 1);
	return bonusAssets[themeIndex % bonusAssets.length];
};

function BonusVideoModal({
	bonus,
	onClose,
}: {
	bonus: ParcoursUserBonus | null;
	onClose: () => void;
}) {
	const videoRef = useRef<ManagedVideoHandle | null>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const videoUri = bonus?.payload
		? resolveParcoursVideoUri(
				bonus.payload as unknown as Record<string, unknown>
		  )
		: null;
	const coverUri = toAbsoluteMediaUrl(bonus?.payload?.coverPhoto?.url);

	useEffect(() => {
		setIsPlaying(false);
	}, [bonus?.id]);

	const closeModal = () => {
		videoRef.current?.pauseAsync().catch(() => {});
		onClose();
	};

	return (
		<Modal
			visible={Boolean(bonus)}
			animationType='slide'
			presentationStyle='fullScreen'
			onRequestClose={closeModal}>
			<View style={styles.modalWrapper}>
				<View style={styles.modalHeader}>
					<Pressable onPress={closeModal} style={styles.modalClose}>
						<Text style={styles.modalCloseText}>Fermer</Text>
					</Pressable>
				</View>
				<Text style={styles.modalWeek}>{bonus ? formatBonusWeek(bonus) : ""}</Text>
				<Text style={styles.modalTitle}>{bonus?.title || "Bonus"}</Text>

				<View style={styles.videoCard}>
					{videoUri ? (
						<ExpoVideo
							ref={videoRef}
							source={{ uri: videoUri }}
							style={styles.video}
							shouldPlay={isPlaying}
							isLooping={false}
							isMuted={false}
							useNativeControls
							resizeMode='cover'
						/>
					) : (
						<View style={styles.videoUnavailable}>
							<Text style={styles.videoUnavailableText}>
								Vidéo indisponible
							</Text>
						</View>
					)}
					{videoUri && !isPlaying ? (
						<Pressable
							onPress={() => {
								setIsPlaying(true);
								videoRef.current?.playAsync().catch(() => {});
							}}
							style={styles.videoOverlay}>
							{coverUri ? (
								<Image
									source={{ uri: coverUri }}
									resizeMode='cover'
									style={StyleSheet.absoluteFillObject}
								/>
							) : null}
							<View style={styles.playButton}>
								<Text style={styles.playButtonText}>▶</Text>
							</View>
						</Pressable>
					) : null}
				</View>
			</View>
		</Modal>
	);
}

export default function BonusScreen() {
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ bonusId?: string | string[] }>();
	const requestedBonusId = Number(
		Array.isArray(params.bonusId) ? params.bonusId[0] : params.bonusId
	);
	const { token, loading: loadingToken } = useJwtToken();
	const { data, isLoading, refetch } = useParcoursBonuses(token, loadingToken);
	const { mutate: markBonusViewed } = useMarkParcoursBonusViewed();
	const autoOpenedBonusIdRef = useRef<number | null>(null);
	const [selectedBonus, setSelectedBonus] = useState<ParcoursUserBonus | null>(
		null
	);
	const bonuses = useMemo(() => data?.data || [], [data?.data]);
	const contentBottomPadding = useMemo(() => insets.bottom + 230, [insets.bottom]);

	useTrackPageMetrics({ page: "Bonus" });

	useFocusEffect(
		useCallback(() => {
			void refetch();
		}, [refetch])
	);

	useEffect(() => {
		if (
			selectedBonus ||
			!Number.isInteger(requestedBonusId) ||
			autoOpenedBonusIdRef.current === requestedBonusId ||
			!bonuses.length
		) {
			return;
		}

		const requestedBonus = bonuses.find(
			(bonus) => bonus.id === requestedBonusId
		);
		if (requestedBonus) {
			autoOpenedBonusIdRef.current = requestedBonusId;
			setSelectedBonus(requestedBonus);
			if (requestedBonus.status === "unlocked") {
				markBonusViewed({ bonusId: requestedBonus.id, token });
			}
		}
	}, [
		bonuses,
		markBonusViewed,
		requestedBonusId,
		selectedBonus,
		token,
	]);

	const openBonus = (bonus: ParcoursUserBonus) => {
		setSelectedBonus(bonus);
		if (bonus.status === "unlocked") {
			markBonusViewed({ bonusId: bonus.id, token });
		}
	};

	if (isLoading) {
		return <Loader />;
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<PageTitleAvatarHeader
				title='Mes bonus'
				showAvatar={false}
				containerStyle={styles.header}
				contentStyle={styles.headerContent}
			/>
			<FlatList
				data={bonuses}
				keyExtractor={(bonus) => String(bonus.id)}
				renderItem={({ item: bonus }) => (
					<Pressable
						onPress={() => openBonus(bonus)}
						style={({ pressed }) => [
							styles.bonusCard,
							pressed && styles.bonusCardPressed,
						]}>
						<View style={styles.bonusIconSlot}>
							<Image
								source={getBonusIcon(bonus)}
								resizeMode='contain'
								style={styles.bonusIcon}
							/>
						</View>
						<View style={styles.bonusText}>
							<Text style={styles.weekLabel}>{formatBonusWeek(bonus)}</Text>
							<Text numberOfLines={2} style={styles.bonusTitle}>
								{bonus.payload?.title || bonus.title}
							</Text>
						</View>
					</Pressable>
				)}
				ListEmptyComponent={
					<View style={styles.emptyState}>
						<Text style={styles.emptyTitle}>Aucun bonus débloqué</Text>
						<Text style={styles.emptyBody}>
							Termine une semaine complète du parcours pour obtenir ton
							premier bonus.
						</Text>
					</View>
				}
				style={styles.list}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[
					styles.listContent,
					{ paddingBottom: contentBottomPadding },
				]}
			/>
			<View
				pointerEvents='box-none'
				style={[
					styles.returnWrap,
					{ bottom: Math.max(insets.bottom + 124, 138) },
				]}>
				<ReturnButton destination='/dashboard' variant='floating' />
			</View>
			<BonusVideoModal
				bonus={selectedBonus}
				onClose={() => setSelectedBonus(null)}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	header: {
		paddingHorizontal: 30,
		paddingBottom: 4,
	},
	headerContent: {
		paddingTop: 24,
		paddingBottom: 14,
	},
	list: {
		flex: 1,
	},
	listContent: {
		paddingHorizontal: 28,
		paddingTop: 4,
		gap: 24,
	},
	bonusCard: {
		minHeight: 106,
		borderRadius: 28,
		backgroundColor: colorWhite,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 18,
		paddingVertical: 14,
	},
	bonusCardPressed: {
		opacity: 0.76,
		transform: [{ scale: 0.99 }],
	},
	bonusIconSlot: {
		width: 84,
		height: 78,
		alignItems: "center",
		justifyContent: "center",
		overflow: "visible",
	},
	bonusIcon: {
		width: 126,
		height: 126,
	},
	bonusText: {
		flex: 1,
		paddingLeft: 12,
		gap: 8,
	},
	weekLabel: {
		fontSize: FontSize12,
		fontWeight: "800",
		color: colorBlack,
	},
	bonusTitle: {
		fontSize: FontSize22,
		lineHeight: 25,
		fontWeight: "900",
		color: colorBlack,
	},
	returnWrap: {
		position: "absolute",
		left: 0,
		right: 0,
		alignItems: "center",
		paddingVertical: 0,
		zIndex: 10,
	},
	emptyState: {
		minHeight: 360,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 28,
	},
	emptyTitle: {
		fontSize: FontSize22,
		fontWeight: "900",
		color: colorBlack,
		textAlign: "center",
		marginBottom: 8,
	},
	emptyBody: {
		fontSize: 16,
		lineHeight: 22,
		fontWeight: "600",
		color: colorDarkGrey,
		textAlign: "center",
	},
	modalWrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
		paddingHorizontal: 28,
		paddingTop: 58,
		alignItems: "center",
	},
	modalHeader: {
		width: "100%",
		alignItems: "flex-end",
		marginBottom: 28,
	},
	modalClose: {
		backgroundColor: colorBlack,
		borderRadius: 999,
		paddingHorizontal: 20,
		paddingVertical: 12,
	},
	modalCloseText: {
		color: colorWhite,
		fontWeight: "800",
	},
	modalWeek: {
		fontSize: FontSize12,
		fontWeight: "800",
		color: colorDarkGrey,
		marginBottom: 8,
	},
	modalTitle: {
		fontSize: 30,
		lineHeight: 34,
		fontWeight: "900",
		color: colorBlack,
		textAlign: "center",
		marginBottom: 26,
	},
	videoCard: {
		width: "100%",
		maxWidth: 360,
		aspectRatio: 9 / 16,
		borderRadius: 30,
		overflow: "hidden",
		backgroundColor: colorBlack,
	},
	video: {
		width: "100%",
		height: "100%",
	},
	videoOverlay: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#191919",
	},
	videoUnavailable: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	videoUnavailableText: {
		color: colorWhite,
		fontWeight: "800",
	},
	playButton: {
		width: 78,
		height: 78,
		borderRadius: 39,
		backgroundColor: "rgba(39,39,39,0.86)",
		alignItems: "center",
		justifyContent: "center",
	},
	playButtonText: {
		color: colorWhite,
		fontSize: 24,
		fontWeight: "900",
		marginLeft: 4,
	},
});
