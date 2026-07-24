import { colorBlack } from "@/constants/colors";
import { FontSize12, FontSize22, FontSizeH3 } from "@/constants/fontsizes";
import React from "react";
import {
	StyleProp,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	ViewStyle,
} from "react-native";

/** Strips diacritics so "É" groups and searches like "E". */
export const normalizeString = (str: string) =>
	str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const SIDEBAR_HIT_SLOP = { top: 4, bottom: 4, left: 12, right: 12 } as const;

interface AlphabetSidebarProps {
	letters: string[];
	onPressLetter: (letter: string) => void;
	style: StyleProp<ViewStyle>;
}

/** The A–Z quick-jump column on the right edge of alphabetical lists. */
export function AlphabetSidebar({
	letters,
	onPressLetter,
	style,
}: AlphabetSidebarProps) {
	return (
		<View style={style}>
			{letters.map((letter) => (
				<TouchableOpacity
					key={letter}
					hitSlop={SIDEBAR_HIT_SLOP}
					onPress={() => onPressLetter(letter)}>
					<Text style={alphabeticalListStyles.sidebarText}>{letter}</Text>
				</TouchableOpacity>
			))}
		</View>
	);
}

/** Grey skeleton lines shown while an alphabetical list loads. */
export function LoadingLines({ count }: { count: number }) {
	return (
		<>
			{Array.from({ length: count }).map((_, index) => (
				<View
					key={index}
					style={[
						alphabeticalListStyles.loadingLine,
						index % 4 === 0 && alphabeticalListStyles.loadingLineShort,
					]}
				/>
			))}
		</>
	);
}

/** Styles shared by the dico and metiers alphabetical list screens. */
export const alphabeticalListStyles = StyleSheet.create({
	contentContainer: {
		flex: 1,
		marginBottom: 80,
		position: "relative",
	},
	listWrapper: {
		flex: 1,
	},
	listContainer: {
		paddingBottom: 60,
	},
	listBodyContent: {
		paddingHorizontal: 5,
		paddingRight: 44,
	},
	listPageHeader: {
		paddingBottom: 8,
	},
	stickySearchContainer: {
		width: "100%",
		paddingTop: 8,
		paddingBottom: 6,
		backgroundColor: "transparent",
	},
	searchBar: {
		width: "100%",
		borderWidth: 2,
		borderColor: "#F5F5F5",
		backgroundColor: "#FFFFFF",
		shadowOpacity: 0,
		elevation: 0,
	},
	loadingLine: {
		height: 20,
		borderRadius: 10,
		backgroundColor: "#E4E4E4",
		marginBottom: 16,
		width: "100%",
	},
	loadingLineShort: {
		width: "70%",
	},
	listHeader: {
		fontWeight: "bold",
		fontSize: FontSizeH3,
		paddingVertical: 5,
		marginTop: 20,
		overflow: "hidden",
	},
	listItem: {
		paddingVertical: 5,
		color: colorBlack,
		fontSize: 18,
		fontWeight: "500",
	},
	lockedItem: {
		opacity: 0.4,
	},
	sidebarText: {
		padding: 1,
		fontSize: FontSize12,
		fontWeight: "bold",
	},
	noDataContainer: {
		flex: 1,
		minHeight: "50%",
		justifyContent: "center",
		alignItems: "center",
		textAlign: "center",
	},
	noDataText: {
		fontSize: FontSize22,
		fontWeight: "bold",
		marginBottom: 20,
	},
});
