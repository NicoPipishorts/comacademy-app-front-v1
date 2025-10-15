// src/screens/Secrets.tsx

import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CardSimpleButtonCommandements from "@/components/cards/CardSimpleButtonCommandements";
import CategoriesCards from "@/components/categories/categories";
import Loader from "@/components/experience/loader";
import FilteredByCat from "@/components/filters/filteredByCat";
import FloatingTabBar from "@/components/FloatingTabBar";
import ScreenHeaders from "@/components/ScreenHeaders";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";

import { primaryBackground } from "@/constants/colors";
import useGetCommandements from "@/hooks/Commandements/useGetAllCommandements";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";

export default function TipsAndTactics() {
	const insets = useSafeAreaInsets();
	const [activeTab, setActiveTab] = useState(0);
	const [filterByCat, setFilterByCat] = useState<number | null>(null);

	const { data: commandements, isFetched } = useGetCommandements(filterByCat);
	useTrackPageMetrics({ page: "Tips and Tactics" });

	const {
		isItemLocked,
		showUpgradeModal,
		handleLockedItemPress,
		closeUpgradeModal,
	} = useSubscriptionLimit({ freeLimit: 5 });

	if (!isFetched || !commandements) {
		return <Loader />;
	}

	// Find the current category’s name, or fallback to an empty string
	const currentCategoryName =
		commandements.data.length > 0
			? commandements.data[0].attributes.catName ?? ""
			: "";

	const chooseCategory = (catId: number) => {
		setFilterByCat(catId);
		setActiveTab(0);
	};

	const handleCommandementPress = (index: number, itemId: number) => {
		if (isItemLocked(index)) {
			handleLockedItemPress();
		} else {
			// Navigate normally - the card handles this
		}
	};

	return (
		<View style={styles.wrapper}>
			<View style={{ paddingHorizontal: 20, paddingTop: insets.top }}>
				<ScreenHeaders content='Tips and Tactics' />
			</View>

			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message="Les 5 premiers Tips and Tactics sont gratuits. Passez à un abonnement premium pour accéder à tous les contenus."
			/>

			{/* only render when we have both a filter and at least one item */}
			{filterByCat !== null && commandements.data.length > 0 && (
				<View style={{ paddingHorizontal: 20, marginVertical: 10 }}>
					<FilteredByCat
						count={commandements.data.length}
						categories={currentCategoryName}
						filterByCat={filterByCat}
						setFilterByCat={setFilterByCat}
					/>
				</View>
			)}

			{commandements.data.length === 0 && (
				<View
					style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
					<Text>Aucun Tip and Tactics trouvé</Text>
				</View>
			)}
			<ScrollView
				showsVerticalScrollIndicator={false}
				style={{ paddingHorizontal: 20 }}
				contentContainerStyle={{ paddingBottom: 100 }}>
				{activeTab === 0 &&
					commandements.data.map((cmd, index) => {
						const imageUrl =
							cmd.attributes.imageUrl ??
							"https://fearless-comfort-efded67ed1.media.strapiapp.com/tips_n_tactics_52aeea960b.png";
						const locked = isItemLocked(index);

						return (
							<CardSimpleButtonCommandements
								key={cmd.id}
								itemId={cmd.id}
								content={cmd.attributes.Theme}
								image={imageUrl}
								locked={locked}
								onPress={
									locked
										? () => handleCommandementPress(index, cmd.id)
										: undefined
								}
							/>
						);
					})}

				{activeTab === 1 && (
					<CategoriesCards
						setFilterByCat={chooseCategory}
						setActiveTab={setActiveTab}
					/>
				)}
			</ScrollView>

			<View style={styles.floatingTabbarContainer}>
				<FloatingTabBar
					activeTab={activeTab}
					setActiveTab={setActiveTab}
					handlePress={() => setActiveTab(activeTab === 0 ? 1 : 0)}
					values={{ btn1: "Voir Tout", btn2: "Catégories" }}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: primaryBackground,
		paddingBottom: 90,
	},
	floatingTabbarContainer: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 110,
		elevation: 5,
		zIndex: 1,
	},
});
