import CardSimpleButtonCitrationsMenu from "@/components/cards/CardSimpleButtonCitrationsMenu";
import Loader from "@/components/experience/loader";
import ScreenHeaders from "@/components/ScreenHeaders";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import { primaryBackground } from "@/constants/colors";
import useGetCitationsMenu from "@/hooks/Citations/useGetCitationsMenu";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const Citations = () => {
	const { data, isLoading } = useGetCitationsMenu();
	const insets = useSafeAreaInsets();
	const { fromDaily, citationCategory } = useLocalSearchParams<{
		fromDaily?: string;
		citationCategory?: string;
	}>();

	const {
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
		isFreeUser,
	} = useSubscriptionLimit({ freeLimit: 0 }); // No citations available for free users

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

	if (isLoading) {
		return <Loader />;
	}

	return (
		<View style={[styles.wrapper, { paddingTop: insets.top }]}>
			<View style={{ paddingHorizontal: 30 }}>
				<ScreenHeaders content='Citations' />
			</View>

			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message="Les citations complètes sont réservées aux membres premium. Seule la citation du jour est accessible gratuitement."
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{ paddingHorizontal: 20 }}
				contentContainerStyle={{ paddingBottom: 100 }}>
				{data?.data.cards.map((citation) => {
					const locked = isFreeUser;
					return (
						<CardSimpleButtonCitrationsMenu
							key={citation.title}
							image={citation.url}
							content={citation.title}
							category={citation.category}
							locked={locked}
							onPress={locked ? handleLockedItemPress : undefined}
						/>
					);
				})}
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
