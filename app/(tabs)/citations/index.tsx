import CardSimpleButtonCitrationsMenu from "@/components/cards/CardSimpleButtonCitrationsMenu";
import LargeImageCardListSkeleton from "@/components/experience/LargeImageCardListSkeleton";
import ScreenHeaders from "@/components/ScreenHeaders";
import { primaryBackground } from "@/constants/colors";
import useGetCitationsMenu from "@/hooks/Citations/useGetCitationsMenu";
import { useTrackRubricOpened } from "@/hooks/Rubrics/useRubricNotifications";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Citations = () => {
	useTrackRubricOpened("citations");
	const { data, isLoading } = useGetCitationsMenu();
	const insets = useSafeAreaInsets();
	const { fromDaily, citationCategory } = useLocalSearchParams<{
		fromDaily?: string;
		citationCategory?: string;
	}>();

	useEffect(() => {
		if (fromDaily === "true") {
			router.push({
				pathname: "/citations/CitationsDetails",
				params: { citationCategory: "all" },
			});
		}
		if (citationCategory) {
			router.push({
				pathname: "/citations/CitationsDetails",
				params: { citationCategory: "all" },
			});
		}
	}, [citationCategory, fromDaily]);

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={{ paddingHorizontal: 30 }}>
				<ScreenHeaders content='Citations' />
			</View>

			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{ paddingHorizontal: 20 }}
				contentContainerStyle={{ paddingBottom: 140 }}>
				{isLoading ? (
					<LargeImageCardListSkeleton
						cardCount={3}
						horizontalPadding={0}
						includeTopSpacing={true}
					/>
				) : (
					(Array.isArray(data?.data?.cards) ? data.data.cards : []).map(
						(citation) => {
							return (
								<CardSimpleButtonCitrationsMenu
									key={citation.title}
									image={citation.url}
									content={citation.title}
									category={citation.category}
								/>
							);
						},
					)
				)}
			</ScrollView>
		</View>
	);
};

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
	},
	noDataContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	citationsWrapper: {
		flexGrow: 0,
		minHeight: "80%",
	},
	citationsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		minWidth: "100%",
		marginBottom: 40,
	},
	cardBackgroundImage: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default Citations;
