import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import { colorBlack, colorWhite, primaryBackground } from "./colors";

// ===== BUTTON STYLES =====

export const buttonBlack: ViewStyle = {
	backgroundColor: colorBlack,
	paddingVertical: 10,
	paddingHorizontal: 35,
	borderRadius: 50,
	alignSelf: "center",
};

export const buttonWhite: ViewStyle = {
	backgroundColor: colorWhite,
	paddingVertical: 10,
	paddingHorizontal: 35,
	borderRadius: 50,
	alignSelf: "center",
};

export const smallButton: ViewStyle = {
	backgroundColor: colorBlack,
	paddingHorizontal: 15,
	paddingVertical: 4,
	borderRadius: 50,
};

// ===== SHADOW STYLES =====

export const cardShadow: ViewStyle = {
	shadowColor: colorBlack,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.35,
	shadowRadius: 15,
};

export const deepShadow: ViewStyle = {
	shadowColor: colorBlack,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.55,
	shadowRadius: 10.84,
};

// ===== FEED CARD STYLES =====

export const feedCardContainer: ViewStyle = {
	marginLeft: 10,
	width: "84%",
	minHeight: 100,
};

export const blackCardWithShadow: ViewStyle = {
	backgroundColor: colorBlack,
	marginLeft: 10,
	width: "84%",
	minHeight: 100,
	paddingVertical: 20,
	paddingHorizontal: 25,
	borderRadius: 20,
	shadowOpacity: 0.35,
	shadowRadius: 15,
	shadowColor: colorBlack,
	shadowOffset: { width: 0, height: 2 },
};

// ===== TEXT STYLES =====

export const boldWhiteText: TextStyle = {
	color: colorWhite,
	fontWeight: "bold",
};

// ===== LAYOUT PATTERNS =====

export const centeredContainer: ViewStyle = {
	justifyContent: "center",
	alignItems: "center",
};

// ===== FAVORITE CARD STYLES =====

export const favoriteCardWrapper: ViewStyle = {
	backgroundColor: colorWhite,
	borderRadius: 15,
	marginBottom: 15,
	overflow: "hidden",
};

export const favoriteCardContainer: ViewStyle = {
	flexDirection: "column",
	justifyContent: "space-between",
	padding: 15,
};

export const cardIconsRow: ViewStyle = {
	flexDirection: "row",
	justifyContent: "flex-start",
	paddingRight: 10,
	paddingBottom: 10,
};

export const categoryIcon: ImageStyle = {
	marginRight: 5,
	width: 24,
	height: 24,
	borderRadius: 50,
	resizeMode: "contain",
};

// ===== MODAL STYLES =====

export const modalSheetBackground: ViewStyle = {
	backgroundColor: primaryBackground,
	borderTopLeftRadius: 20,
	borderTopRightRadius: 20,
};

export const hiddenIndicator: ViewStyle = {
	opacity: 0,
	height: 0,
};

// ===== GRADIENT CARD STYLES =====

export const gradientCardWrapper: ViewStyle = {
	position: "relative",
	justifyContent: "flex-start",
	backgroundColor: colorBlack,
	paddingHorizontal: 30,
	borderRadius: 25,
	shadowColor: colorBlack,
	shadowOffset: { width: 0, height: 2 },
	shadowOpacity: 0.55,
	shadowRadius: 10.84,
};

export const largeNumberOverlay: TextStyle = {
	color: colorWhite,
	fontSize: 148,
	opacity: 0.2,
	fontWeight: "bold",
};

export const cardNumberWrapper: ViewStyle = {
	marginTop: 20,
	position: "absolute",
	left: 30,
};
