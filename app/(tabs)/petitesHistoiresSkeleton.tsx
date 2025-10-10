import React from "react";
import {
	Dimensions,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import { colorGrey } from "@/constants/colors";

type Props = {
	paddingTop?: number;
};

const PetitesHistoiresSkeleton = ({ paddingTop = 0 }: Props) => {
	const { width } = Dimensions.get("window");
	const cardWidth = Math.floor(width * 0.8);
	const cardHeight = Math.floor((cardWidth / 9) * 16);

	const placeholders = Array.from({ length: 4 });

	return (
		<View style={[styles.wrapper, { paddingTop }]}>
			<View style={styles.headerPadding}>
				<View style={styles.headerSkeleton} />
			</View>
			<ScrollView
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.contentPadding}
				style={styles.list}>
				{placeholders.map((_, index) => (
					<View
						key={index}
						style={[
							styles.cardSkeleton,
							{ width: cardWidth, height: cardHeight },
						]}
					/>
				))}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: "#f0f0f0",
	},
	headerPadding: {
		paddingHorizontal: 30,
	},
	headerSkeleton: {
		width: 220,
		height: 32,
		borderRadius: 8,
		backgroundColor: colorGrey,
	},
	list: {
		marginTop: 30,
		paddingHorizontal: 30,
	},
	contentPadding: {
		paddingRight: 25,
	},
	cardSkeleton: {
		marginLeft: 10,
		marginRight: 24,
		borderRadius: 10,
		backgroundColor: colorGrey,
	},
});

export default PetitesHistoiresSkeleton;
