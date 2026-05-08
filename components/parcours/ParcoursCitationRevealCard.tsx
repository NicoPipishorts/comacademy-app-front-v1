import CardLesCitations from "@/components/cards/CardLesCitations";
import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize12, FontSize16 } from "@/constants/fontsizes";
import { CitationData } from "@/types/lesCitations";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
	LayoutChangeEvent,
	PanResponder,
	StyleSheet,
	Text,
	View,
} from "react-native";
import Svg, { Circle, Defs, Mask, Rect } from "react-native-svg";

const REVEAL_THRESHOLD = 0.95;
const SCRATCH_RADIUS = 34;

export default function ParcoursCitationRevealCard({
	id,
	theme,
	text,
	author,
	revealed,
	onRevealProgress,
	onRevealComplete,
}: {
	id: string;
	theme?: string | null;
	text: string;
	author?: string | null;
	revealed: boolean;
	onRevealProgress?: (progress: number) => void;
	onRevealComplete?: () => void;
}) {
	const [cardWidth, setCardWidth] = useState(0);
	const [cardHeight, setCardHeight] = useState(0);
	const [revealProgress, setRevealProgress] = useState(revealed ? 1 : 0);
	const [scratchPoints, setScratchPoints] = useState<Array<{ x: number; y: number }>>([]);
	const maxProgressRef = useRef(revealed ? 1 : 0);
	const scratchedBucketsRef = useRef<Set<number>>(new Set());

	useEffect(() => {
		if (revealed) {
			maxProgressRef.current = 1;
			setRevealProgress(1);
			setScratchPoints([]);
		}
	}, [revealed]);

	const citation = useMemo<CitationData>(
		() => ({
			id: Number.parseInt(id.replace(/\D/g, ""), 10) || 0,
			attributes: {
				AUTEUR: author || "",
				CATEGORIE: theme || "Citation",
				CITATION: text,
				createdAt: "",
				updatedAt: "",
			},
		}),
		[author, id, text, theme]
	);

	const commitProgress = (nextProgress: number) => {
		const safeProgress = Math.max(maxProgressRef.current, nextProgress);
		maxProgressRef.current = safeProgress;
		setRevealProgress(safeProgress);
		onRevealProgress?.(safeProgress);

		if (safeProgress >= REVEAL_THRESHOLD) {
			onRevealComplete?.();
		}
	};

	const handleLayout = (event: LayoutChangeEvent) => {
		setCardWidth(event.nativeEvent.layout.width);
		setCardHeight(event.nativeEvent.layout.height);
	};

	const handleScratch = (x: number, y: number) => {
		if (!cardWidth || !cardHeight || revealed) {
			return;
		}

		const safeX = Math.max(0, Math.min(x, cardWidth));
		const safeY = Math.max(0, Math.min(y, cardHeight));
		const totalBuckets = 24;
		const bucketIndex = Math.min(
			totalBuckets - 1,
			Math.floor((safeX / Math.max(cardWidth, 1)) * totalBuckets)
		);
		scratchedBucketsRef.current.add(bucketIndex);
		setScratchPoints((current) => [...current, { x: safeX, y: safeY }]);
		commitProgress(scratchedBucketsRef.current.size / totalBuckets);
	};

	const panResponder = useMemo(
		() =>
			PanResponder.create({
				onStartShouldSetPanResponder: () => !revealed,
				onMoveShouldSetPanResponder: () => !revealed,
				onPanResponderGrant: (event) => {
					handleScratch(
						event.nativeEvent.locationX,
						event.nativeEvent.locationY
					);
				},
				onPanResponderMove: (event) => {
					handleScratch(
						event.nativeEvent.locationX,
						event.nativeEvent.locationY
					);
				},
			}),
		[cardHeight, cardWidth, revealed]
	);

	return (
		<View style={styles.container}>
			<Text style={styles.stepLabel}>{theme || "Citation"}</Text>
			<View onLayout={handleLayout} style={styles.cardWrap}>
				<CardLesCitations
					citation={citation}
					showFavorite={false}
					wrapperStyle={styles.cardWrapper}
					cardStyle={styles.cardStyle}
				/>
				{!revealed ? (
					<View style={styles.overlayRoot} {...panResponder.panHandlers}>
						{cardWidth > 0 && cardHeight > 0 ? (
							<Svg
								pointerEvents='none'
								width={cardWidth}
								height={cardHeight}
								style={styles.overlaySvg}>
								<Defs>
									<Mask id={`scratchMask-${id}`}>
										<Rect width={cardWidth} height={cardHeight} fill='#FFF' />
										{scratchPoints.map((point, index) => (
											<Circle
												key={`${id}-${index}`}
												cx={point.x}
												cy={point.y}
												r={SCRATCH_RADIUS}
												fill='#000'
											/>
										))}
									</Mask>
								</Defs>
								<Rect
									width={cardWidth}
									height={cardHeight}
									fill='#F3EEF4'
									mask={`url(#scratchMask-${id})`}
								/>
							</Svg>
						) : null}
						<View style={styles.instructionBlock}>
							<Text style={styles.instructionTitle}>Glisse pour reveler</Text>
							<Text style={styles.instructionText}>
								Decouvre 95% de la citation pour continuer.
							</Text>
						</View>
					</View>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 12,
		justifyContent: "center",
		width: "100%",
	},
	stepLabel: {
		fontSize: FontSize12,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 2,
	},
	cardWrap: {
		position: "relative",
		width: "100%",
	},
	cardWrapper: {
		marginTop: 0,
	},
	cardStyle: {
		marginHorizontal: 0,
		maxWidth: "100%",
		minHeight: 300,
	},
	overlayRoot: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 20,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
	},
	overlaySvg: {
		...StyleSheet.absoluteFillObject,
	},
	instructionBlock: {
		position: "absolute",
		left: 20,
		right: 20,
		bottom: 20,
		zIndex: 2,
		backgroundColor: "rgba(0,0,0,0.55)",
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	instructionTitle: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorWhite,
		marginBottom: 4,
	},
	instructionText: {
		fontSize: FontSize12,
		fontWeight: "600",
		color: colorWhite,
		opacity: 0.9,
	},
});
