import CardLesCitations from "@/components/cards/CardLesCitations";
import { CitationFavoritesProvider } from "@/context/CitationFavoritesContext";
import { CitationData } from "@/types/lesCitations";
import {
	BlurMask,
	Canvas,
	Circle,
	Group,
	LinearGradient,
	Path,
	Rect,
	Skia,
	useClock,
	vec,
} from "@shopify/react-native-skia";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ReAnimated, {
	Easing,
	runOnJS,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import type { SharedValue } from "react-native-reanimated";

const REVEAL_THRESHOLD = 0.93;
// Soft round brush. Visual stroke + blur ≈ erase radius.
const BRUSH_STROKE = 42;
const BRUSH_BLUR = 16;
const PROGRESS_BRUSH_RADIUS = 34;
const MIN_MOVE_SQ = 9; // 3 px minimum travel between samples
const FADE_DURATION = 360;
// Invisible coarse grid used only for the 90 % math (never rendered).
const PROGRESS_CELL = 14;
const SPARKLE_COUNT = 46;
const DEFAULT_ACCENT = "#D63C96";

type SparkleSpec = {
	relX: number;
	relY: number;
	r: number;
	phaseOffset: number; // radians, randomizes where in the cycle it starts
	speed: number; // rad/ms — randomized per dot so they twinkle out of sync
	tint: 0 | 1;
};

// One independently-twinkling dot. Opacity is a sine of a shared monotonic
// clock plus this dot's own phase/speed, so the field shimmers asynchronously.
function Sparkle({
	clock,
	cx,
	cy,
	r,
	color,
	speed,
	phaseOffset,
}: {
	clock: SharedValue<number>;
	cx: number;
	cy: number;
	r: number;
	color: string;
	speed: number;
	phaseOffset: number;
}) {
	const opacity = useDerivedValue(
		() => 0.2 + 0.8 * (0.5 + 0.5 * Math.sin(clock.value * speed + phaseOffset))
	);
	return (
		<Circle cx={cx} cy={cy} r={r} color={color} opacity={opacity}>
			<BlurMask blur={r * 0.9} style='solid' />
		</Circle>
	);
}

function createSeededRandom(seed: string) {
	let h = 1779033703 ^ seed.length;
	for (let i = 0; i < seed.length; i += 1) {
		h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
		h = (h << 13) | (h >>> 19);
	}
	return () => {
		h = Math.imul(h ^ (h >>> 16), 2246822507);
		h = Math.imul(h ^ (h >>> 13), 3266489909);
		h ^= h >>> 16;
		return (h >>> 0) / 4294967296;
	};
}

// Parse "#RGB" / "#RRGGBB" → [r,g,b]; fall back to the default accent.
function parseHex(input: string): [number, number, number] {
	let hex = input.trim().replace(/^#/, "");
	if (hex.length === 3) {
		hex = hex
			.split("")
			.map((c) => c + c)
			.join("");
	}
	if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
		hex = DEFAULT_ACCENT.replace(/^#/, "");
	}
	return [
		parseInt(hex.slice(0, 2), 16),
		parseInt(hex.slice(2, 4), 16),
		parseInt(hex.slice(4, 6), 16),
	];
}

// Mix a color toward white (amount > 0) or black (amount < 0). Always opaque.
function shade([r, g, b]: [number, number, number], amount: number): string {
	const t = Math.abs(amount);
	const target = amount >= 0 ? 255 : 0;
	const mix = (c: number) => Math.round(c + (target - c) * t);
	return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export default function ParcoursCitationRevealCard({
	id,
	theme,
	text,
	author,
	revealed,
	accentColor,
	onRevealProgress,
	onRevealComplete,
	onScratchStart,
	onScratchEnd,
}: {
	id: string;
	theme?: string | null;
	text: string;
	author?: string | null;
	revealed: boolean;
	accentColor?: string | null;
	onRevealProgress?: (progress: number) => void;
	onRevealComplete?: () => void;
	onScratchStart?: () => void;
	onScratchEnd?: () => void;
}) {
	const [dims, setDims] = useState({ width: 0, height: 0 });
	const [locallyRevealed, setLocallyRevealed] = useState(revealed);
	const [revealFinished, setRevealFinished] = useState(revealed);

	// Progress tracking lives entirely in refs — no re-render while erasing.
	const clearedCellsRef = useRef<Set<number>>(new Set());
	const maxProgressRef = useRef(revealed ? 1 : 0);
	const gridColsRef = useRef(1);
	const gridRowsRef = useRef(1);
	const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Erase path is a Skia path held in a shared value (UI-thread reactive).
	const erasePath = useSharedValue(Skia.Path.Make());
	const lastPoint = useSharedValue({ x: 0, y: 0 });

	// Animation drivers
	const clock = useClock(); // monotonic ms, drives independent dot twinkles
	const overlayOpacity = useSharedValue(revealed ? 0 : 1);

	useEffect(() => {
		overlayOpacity.value = withTiming(locallyRevealed || revealed ? 0 : 1, {
			duration: FADE_DURATION,
			easing: Easing.out(Easing.cubic),
		});
	}, [locallyRevealed, revealed, overlayOpacity]);

	// Reset everything when the citation or revealed prop changes.
	useEffect(() => {
		setLocallyRevealed(revealed);
		setRevealFinished(revealed);
		maxProgressRef.current = revealed ? 1 : 0;
		clearedCellsRef.current = new Set();
		erasePath.value = Skia.Path.Make();
		overlayOpacity.value = revealed ? 0 : 1;
		if (revealTimerRef.current) {
			clearTimeout(revealTimerRef.current);
			revealTimerRef.current = null;
		}
	}, [id, revealed, erasePath, overlayOpacity]);

	useEffect(
		() => () => {
			if (revealTimerRef.current) {
				clearTimeout(revealTimerRef.current);
			}
		},
		[]
	);

	const overlayInteractive = !locallyRevealed && !revealed;
	const showOverlay = !revealed;
	const hasLayout = dims.width > 0 && dims.height > 0;

	// Opaque accent palette for the cover (no see-through).
	const palette = useMemo(() => {
		const rgb = parseHex(accentColor || DEFAULT_ACCENT);
		return {
			light: shade(rgb, 0.18),
			base: shade(rgb, 0),
			deep: shade(rgb, -0.16),
		};
	}, [accentColor]);

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

	// Seeded sparkle field — stable per citation id.
	const sparkles = useMemo<SparkleSpec[]>(() => {
		const random = createSeededRandom(id);
		return Array.from({ length: SPARKLE_COUNT }, () => ({
			relX: 0.04 + random() * 0.92,
			relY: 0.05 + random() * 0.9,
			r: 1.6 + random() * 5.5,
			phaseOffset: random() * Math.PI * 2,
			// ~520ms (fast) … ~1400ms per cycle, randomized per dot
			speed: 0.0045 + random() * 0.0075,
			tint: (random() < 0.3 ? 1 : 0) as 0 | 1,
		}));
	}, [id]);

	// JS-side progress accounting — called (throttled) from the gesture worklet.
	const registerScratch = useCallback(
		(x: number, y: number) => {
			if (!overlayInteractive) return;

			const cols = gridColsRef.current;
			const rows = gridRowsRef.current;
			const colMin = Math.max(0, Math.floor((x - PROGRESS_BRUSH_RADIUS) / PROGRESS_CELL));
			const colMax = Math.min(cols - 1, Math.floor((x + PROGRESS_BRUSH_RADIUS) / PROGRESS_CELL));
			const rowMin = Math.max(0, Math.floor((y - PROGRESS_BRUSH_RADIUS) / PROGRESS_CELL));
			const rowMax = Math.min(rows - 1, Math.floor((y + PROGRESS_BRUSH_RADIUS) / PROGRESS_CELL));
			const rSq = PROGRESS_BRUSH_RADIUS * PROGRESS_BRUSH_RADIUS;

			for (let row = rowMin; row <= rowMax; row++) {
				for (let col = colMin; col <= colMax; col++) {
					const cx = col * PROGRESS_CELL + PROGRESS_CELL / 2;
					const cy = row * PROGRESS_CELL + PROGRESS_CELL / 2;
					const dx = cx - x;
					const dy = cy - y;
					if (dx * dx + dy * dy <= rSq) {
						clearedCellsRef.current.add(row * cols + col);
					}
				}
			}

			const total = cols * rows;
			const progress = total > 0 ? clearedCellsRef.current.size / total : 0;
			const safe = Math.max(maxProgressRef.current, progress);
			maxProgressRef.current = safe;
			onRevealProgress?.(safe);

			if (safe >= REVEAL_THRESHOLD && !locallyRevealed) {
				setLocallyRevealed(true);
				if (!revealTimerRef.current) {
					revealTimerRef.current = setTimeout(() => {
						revealTimerRef.current = null;
						setRevealFinished(true);
						onRevealComplete?.();
					}, FADE_DURATION);
				}
			}
		},
		[overlayInteractive, locallyRevealed, onRevealProgress, onRevealComplete]
	);

	const handleScratchStart = useCallback(() => {
		onScratchStart?.();
	}, [onScratchStart]);

	const handleScratchEnd = useCallback(() => {
		onScratchEnd?.();
	}, [onScratchEnd]);

	const pan = useMemo(
		() =>
			Gesture.Pan()
				.enabled(overlayInteractive)
				.maxPointers(1)
				.minDistance(0)
				.onStart((e) => {
					"worklet";
					const p = erasePath.value.copy();
					p.moveTo(e.x, e.y);
					// tiny segment so a tap still paints a soft dot
					p.lineTo(e.x + 0.4, e.y + 0.4);
					erasePath.value = p;
					lastPoint.value = { x: e.x, y: e.y };
					runOnJS(handleScratchStart)();
					runOnJS(registerScratch)(e.x, e.y);
				})
				.onUpdate((e) => {
					"worklet";
					const dx = e.x - lastPoint.value.x;
					const dy = e.y - lastPoint.value.y;
					if (dx * dx + dy * dy < MIN_MOVE_SQ) return;
					const p = erasePath.value.copy();
					p.lineTo(e.x, e.y);
					erasePath.value = p;
					lastPoint.value = { x: e.x, y: e.y };
					runOnJS(registerScratch)(e.x, e.y);
				})
				.onEnd(() => {
					"worklet";
					runOnJS(handleScratchEnd)();
				})
				.onFinalize(() => {
					"worklet";
					runOnJS(handleScratchEnd)();
				}),
		[
			overlayInteractive,
			erasePath,
			lastPoint,
			handleScratchStart,
			handleScratchEnd,
			registerScratch,
		]
	);

	// ── Layout ───────────────────────────────────────────────────────────────
	const handleLayout = useCallback((event: LayoutChangeEvent) => {
		const { width, height } = event.nativeEvent.layout;
		setDims((prev) =>
			prev.width === width && prev.height === height ? prev : { width, height }
		);
		gridColsRef.current = Math.max(1, Math.ceil(width / PROGRESS_CELL));
		gridRowsRef.current = Math.max(1, Math.ceil(height / PROGRESS_CELL));
	}, []);

	const overlayFadeStyle = useAnimatedStyle(() => ({
		opacity: overlayOpacity.value,
	}));

	return (
		<View style={styles.container}>
			<View onLayout={handleLayout} style={styles.cardWrap}>
				<CitationFavoritesProvider>
					<CardLesCitations
						citation={citation}
						showFavorite={revealFinished}
						wrapperStyle={styles.cardWrapper}
						cardStyle={styles.cardStyle}
					/>
				</CitationFavoritesProvider>

				{showOverlay && hasLayout ? (
					<ReAnimated.View
						style={[styles.overlayRoot, overlayFadeStyle]}
						pointerEvents={overlayInteractive ? "auto" : "none"}>
						<GestureDetector gesture={pan}>
							<Canvas style={styles.canvas}>
								{/* Everything inside this layer is erased together by the
								    clear-blend path, revealing the card underneath. */}
								<Group layer>
									{/* Opaque accent base — fully covers the citation */}
									<Rect x={0} y={0} width={dims.width} height={dims.height}>
										<LinearGradient
											start={vec(0, 0)}
											end={vec(dims.width, dims.height)}
											colors={[palette.light, palette.base, palette.deep]}
										/>
									</Rect>

									{/* Glitter sparkles — each twinkles independently */}
									<Group>
										{sparkles.map((s, i) => (
											<Sparkle
												key={`${id}-sp-${i}`}
												clock={clock}
												cx={s.relX * dims.width}
												cy={s.relY * dims.height}
												r={s.r}
												color={
													s.tint === 1
														? "rgba(255,255,255,0.78)"
														: "rgba(255,255,255,0.96)"
												}
												speed={s.speed}
												phaseOffset={s.phaseOffset}
											/>
										))}
									</Group>

									{/* Soft round eraser following the finger */}
									<Path
										path={erasePath}
										style='stroke'
										strokeWidth={BRUSH_STROKE}
										strokeCap='round'
										strokeJoin='round'
										color='black'
										blendMode='clear'>
										<BlurMask blur={BRUSH_BLUR} style='normal' />
									</Path>
								</Group>
							</Canvas>
						</GestureDetector>
					</ReAnimated.View>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		justifyContent: "center",
		width: "100%",
	},
	cardWrap: {
		position: "relative",
		width: "100%",
		borderRadius: 22,
		backgroundColor: "transparent",
	},
	cardWrapper: {
		marginTop: 0,
	},
	cardStyle: {
		marginHorizontal: 0,
		minHeight: 300,
		shadowOpacity: 0,
		shadowRadius: 0,
		shadowOffset: { width: 0, height: 0 },
		elevation: 0,
	},
	overlayRoot: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 22,
		overflow: "hidden",
	},
	canvas: {
		flex: 1,
	},
});
