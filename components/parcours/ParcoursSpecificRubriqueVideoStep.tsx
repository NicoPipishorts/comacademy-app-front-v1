import SplashScreen from "@/assets/imgs/spalshSceens/petiteHistoire.png";
import ExpoVideo, {
	CompatVideoStatus,
	ManagedVideoHandle,
} from "@/components/media/ExpoVideo";
import {
	colorBlack,
	colorWhite,
	primaryBackground,
} from "@/constants/colors";
import {
	FontSize14,
	FontSize18,
} from "@/constants/fontsizes";
import React, { useRef, useState } from "react";
import {
	Animated,
	Image,
	Pressable,
	StyleSheet,
	Text,
	View,
} from "react-native";

const VIDEO_WIDTH = 280;
const VIDEO_HEIGHT = 498;

export default function ParcoursSpecificRubriqueVideoStep({
	title,
	videoUri,
	accentColor,
	initialPositionMillis = 0,
	onPlaybackStatusUpdate,
}: {
	title: string;
	videoUri: string;
	accentColor: string;
	initialPositionMillis?: number;
	onPlaybackStatusUpdate?: (status: CompatVideoStatus) => void;
}) {
	const videoRef = useRef<ManagedVideoHandle | null>(null);
	const overlayOpacity = useRef(new Animated.Value(1)).current;
	const [isPlaying, setIsPlaying] = useState(false);
	const [startPositionMillis] = useState(initialPositionMillis);

	const fadeOutOverlay = () => {
		Animated.timing(overlayOpacity, {
			toValue: 0,
			duration: 350,
			useNativeDriver: true,
		}).start();
	};

	const showOverlay = () => {
		Animated.timing(overlayOpacity, {
			toValue: 1,
			duration: 250,
			useNativeDriver: true,
		}).start();
	};

	return (
		<View style={styles.container}>
			<Text style={styles.stepTitle}>{title}</Text>

			<View style={[styles.videoCard, { borderColor: accentColor }]}>
				<ExpoVideo
					ref={(ref) => {
						videoRef.current = ref;
					}}
					source={{ uri: videoUri }}
					style={styles.video}
					isMuted={false}
					isLooping={false}
					shouldPlay={isPlaying}
					positionMillis={startPositionMillis}
					useNativeControls
					resizeMode='cover'
					onPlaybackStatusUpdate={(status) => {
						if (!status.isPlaying && status.didJustFinish) {
							setIsPlaying(false);
							showOverlay();
						}
						onPlaybackStatusUpdate?.(status);
					}}
				/>

				{!isPlaying ? (
					<Animated.View
						style={[
							StyleSheet.absoluteFillObject,
							styles.overlayContainer,
							{ opacity: overlayOpacity },
						]}>
						<Image source={SplashScreen} style={styles.thumbnail} resizeMode='cover' />
						<Pressable
							style={styles.playButtonContainer}
							onPress={() => {
								setIsPlaying(true);
								fadeOutOverlay();
								videoRef.current?.playAsync().catch(() => {});
							}}>
							<Text style={styles.playIcon}>▶</Text>
						</Pressable>
					</Animated.View>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		gap: 16,
		alignItems: "center",
	},
	stepTitle: {
		alignSelf: "flex-start",
		fontSize: FontSize18,
		lineHeight: 24,
		fontWeight: "800",
		color: colorBlack,
	},
	videoCard: {
		width: VIDEO_WIDTH,
		height: VIDEO_HEIGHT,
		borderRadius: 28,
		overflow: "hidden",
		backgroundColor: primaryBackground,
		borderWidth: 2,
	},
	video: {
		width: "100%",
		height: "100%",
	},
	overlayContainer: {
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#000000",
	},
	thumbnail: {
		...StyleSheet.absoluteFillObject,
		width: "100%",
		height: "100%",
	},
	playButtonContainer: {
		width: 78,
		height: 78,
		borderRadius: 39,
		backgroundColor: "rgba(39,39,39,0.82)",
		alignItems: "center",
		justifyContent: "center",
	},
	playIcon: {
		color: colorWhite,
		fontSize: FontSize14,
		fontWeight: "900",
		marginLeft: 4,
	},
});
