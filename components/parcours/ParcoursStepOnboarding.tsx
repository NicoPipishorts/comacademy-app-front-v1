import { colorBlack, colorWhite } from "@/constants/colors";
import { FontSize14, FontSize16 } from "@/constants/fontsizes";
import React, { ReactNode } from "react";
import {
	Image,
	ImageSourcePropType,
	ImageStyle,
	Pressable,
	StyleProp,
	StyleSheet,
	Text,
	TextStyle,
	View,
	ViewStyle,
} from "react-native";

export interface ParcoursStepOnboardingProps {
	dateLabel: string;
	currentIndex: number;
	totalSteps: number;
	onStart: () => void;
	backgroundColor: string;
	accentColor: string;
	stepAccentColor?: string;
	buttonColor?: string;
	title: ReactNode;
	imageSource: ImageSourcePropType;
	body: ReactNode;
	supportText?: ReactNode;
	wrapperStyle?: StyleProp<ViewStyle>;
	topMetaStyle?: StyleProp<ViewStyle>;
	titleStyle?: StyleProp<TextStyle>;
	visualStyle?: StyleProp<ViewStyle>;
	imageStyle?: StyleProp<ImageStyle>;
	bodyStyle?: StyleProp<TextStyle>;
	supportTextStyle?: StyleProp<TextStyle>;
	bottomBlockStyle?: StyleProp<ViewStyle>;
}

export default function ParcoursStepOnboarding({
	dateLabel,
	currentIndex,
	totalSteps,
	onStart,
	backgroundColor,
	accentColor,
	stepAccentColor = accentColor,
	buttonColor = accentColor,
	title,
	imageSource,
	body,
	supportText,
	wrapperStyle,
	topMetaStyle,
	titleStyle,
	visualStyle,
	imageStyle,
	bodyStyle,
	supportTextStyle,
	bottomBlockStyle,
}: ParcoursStepOnboardingProps) {
	return (
		<View style={[styles.wrapper, { backgroundColor }, wrapperStyle]}>
			<View style={[styles.topMeta, topMetaStyle]}>
				<Text style={styles.dateLabel}>{dateLabel}</Text>
				<View style={[styles.stepPill, { borderColor: stepAccentColor }]}>
					<Text style={[styles.stepPillText, { color: stepAccentColor }]}>
						Etape {currentIndex + 1}/{totalSteps}
					</Text>
				</View>
				<Text style={[styles.title, titleStyle]}>{title}</Text>
			</View>

			<View style={[styles.visualWrap, visualStyle]}>
				<Image source={imageSource} resizeMode='contain' style={imageStyle} />
			</View>

			<View style={[styles.bottomBlock, bottomBlockStyle]}>
				<Text style={[styles.bodyText, bodyStyle]}>{body}</Text>
				{supportText ? (
					<Text style={[styles.supportText, supportTextStyle]}>
						{supportText}
					</Text>
				) : null}

				<Pressable
					onPress={onStart}
					style={[styles.startButton, { backgroundColor: buttonColor }]}>
					<Text style={styles.startButtonText}>C&apos;est parti !</Text>
				</Pressable>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		position: "relative",
	},
	topMeta: {
		position: "absolute",
		top: 34,
		left: 24,
		right: 24,
		alignItems: "center",
	},
	dateLabel: {
		fontSize: FontSize16,
		fontWeight: "800",
		color: colorBlack,
		marginBottom: 14,
	},
	stepPill: {
		minWidth: 98,
		height: 28,
		borderRadius: 14,
		borderWidth: 2,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 16,
		marginBottom: 14,
	},
	stepPillText: {
		fontSize: FontSize14,
		fontWeight: "800",
	},
	title: {
		fontSize: 44,
		fontWeight: "900",
		color: colorBlack,
		textAlign: "center",
	},
	visualWrap: {
		position: "absolute",
		left: 0,
		right: 0,
		alignItems: "center",
		justifyContent: "center",
	},
	bottomBlock: {
		position: "absolute",
		left: 30,
		right: 30,
		bottom: 56,
		alignItems: "center",
	},
	bodyText: {
		fontSize: 31,
		lineHeight: 35,
		fontWeight: "900",
		color: colorBlack,
		textAlign: "center",
		maxWidth: 340,
		marginBottom: 22,
	},
	supportText: {
		fontSize: 18,
		lineHeight: 20,
		fontWeight: "700",
		color: colorBlack,
		textAlign: "center",
		maxWidth: 340,
		marginBottom: 26,
	},
	startButton: {
		width: "100%",
		maxWidth: 342,
		height: 58,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
	},
	startButtonText: {
		fontSize: 20,
		fontWeight: "900",
		color: colorWhite,
	},
});
