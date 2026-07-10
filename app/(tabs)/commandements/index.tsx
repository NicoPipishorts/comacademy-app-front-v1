// src/screens/Secrets.tsx

import React, { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CardSimpleButtonCommandements from "@/components/cards/CardSimpleButtonCommandements";
import CategoriesCards from "@/components/categories/categories";
import LargeImageCardListSkeleton from "@/components/experience/LargeImageCardListSkeleton";
import FilteredByCat from "@/components/filters/filteredByCat";
import FloatingTabBar from "@/components/FloatingTabBar";
import UpgradeSubscriptionModal from "@/components/modal/UpgradeSubscriptionModal";
import PageTitleAvatarHeader from "@/components/PageTitleAvatarHeader";

import { primaryBackground } from "@/constants/colors";
import useGetCommandements from "@/hooks/Commandements/useGetAllCommandements";
import { useTrackPageMetrics } from "@/hooks/Metrics/usePageMetrics";
import { useTrackRubricOpened } from "@/hooks/Rubrics/useRubricNotifications";
import { useSubscriptionLimit } from "@/hooks/useSubscriptionLimit";
import { resolveMediaUrl } from "@/src/utils/resolveMediaUrl";

const DEFAULT_COMMANDEMENT_IMAGE_URL =
	"https://fearless-comfort-efded67ed1.media.strapiapp.com/tips_n_tactics_52aeea960b.png";

export default function TipsAndTactics() {
	useTrackRubricOpened("commandements");
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

	// Find the current category’s name, or fallback to an empty string
	const currentCategoryName =
		commandements && commandements.data.length > 0
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
			<UpgradeSubscriptionModal
				visible={showUpgradeModal}
				onClose={closeUpgradeModal}
				message='Les 5 premiers Tips and Tactics sont gratuits. Passez à un abonnement premium pour accéder à tous les contenus.'
			/>

			<ScrollView
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{
					paddingTop: insets.top,
					paddingHorizontal: 20,
					paddingBottom: 100,
				}}>
				<PageTitleAvatarHeader title='Tips and Tactics' showAvatar={false} />

				{/* only render when we have both a filter and at least one item */}
				{filterByCat !== null &&
					commandements &&
					commandements.data.length > 0 && (
					<View style={{ marginVertical: 10 }}>
						<FilteredByCat
							count={commandements.data.length}
							categories={currentCategoryName}
							filterByCat={filterByCat}
							setFilterByCat={setFilterByCat}
						/>
					</View>
				)}

				{isFetched && commandements && commandements.data.length === 0 && (
					<View style={styles.emptyStateContainer}>
						<Text>Aucun Tip and Tactics trouvé</Text>
					</View>
				)}

				{activeTab === 0 &&
					!isFetched && (
						<LargeImageCardListSkeleton
							cardCount={3}
							horizontalPadding={0}
							includeTopSpacing={true}
						/>
					)}

				{activeTab === 0 &&
					isFetched &&
					commandements &&
					commandements.data.map((cmd, index) => {
						const imageUrl = resolveMediaUrl(
							cmd.attributes.imageUrl,
							DEFAULT_COMMANDEMENT_IMAGE_URL,
						);
						const locked = isItemLocked(index);

						return (
							<View key={cmd.id}>
								<CardSimpleButtonCommandements
									itemId={cmd.attributes.documentId}
									content={cmd.attributes.Theme}
									image={imageUrl}
									locked={locked}
									onPress={
										locked
											? () => handleCommandementPress(index, cmd.id)
										: undefined
									}
								/>
							</View>
						);
					})}

				{activeTab === 1 && isFetched && commandements && (
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
		bottom: 130,
		elevation: 5,
		zIndex: 1,
	},
	emptyStateContainer: {
		minHeight: 220,
		justifyContent: "center",
		alignItems: "center",
	},
});
